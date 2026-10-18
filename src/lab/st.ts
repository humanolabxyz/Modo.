import type {Memory,Tag} from './model';
export type Diagnostic={code:string;message:string;line?:number;rung?:string};
type Scalar='bool'|'number';
type Expr={kind:'literal';value:boolean|number;type:Scalar}|{kind:'ref';address:string;type:Scalar}|{kind:'unary';op:string;value:Expr;type:Scalar}|{kind:'binary';op:string;left:Expr;right:Expr;type:Scalar};
type Statement={kind:'assign';address:string;expr:Expr}|{kind:'if';condition:Expr;yes:Statement[];no:Statement[]};
type Token={text:string;line:number};
export type STProgram={statements:Statement[];diagnostics:Diagnostic[]};
const PRECEDENCE:Record<string,number>={OR:1,XOR:2,AND:3,'=':4,'<>':4,'<':5,'>':5,'<=':5,'>=':5,'+':6,'-':6,'*':7,'/':7,MOD:7};

export function compileST(source:string,tags:Tag[]):STProgram {
  const tokens:Token[]=[];let index=0,line=1;
  const diagnostics:Diagnostic[]=[];
  while(index<source.length){
    const text=source.slice(index);
    const spaces=/^\s+/.exec(text);if(spaces){line+=(spaces[0].match(/\n/g)||[]).length;index+=spaces[0].length;continue;}
    if(text.startsWith('//')){const end=text.indexOf('\n');index=end<0?source.length:index+end;continue;}
    const comment=/^\(\*[\s\S]*?\*\)/.exec(text);if(comment){line+=(comment[0].match(/\n/g)||[]).length;index+=comment[0].length;continue;}
    const token=/^(?::=|<=|>=|<>|[A-Za-z_][A-Za-z_0-9]*(?:\.[0-7])?|\d+(?:\.\d+)?|[()+\-*/;=<>])/.exec(text);
    if(!token){diagnostics.push({code:'ST001',message:`Carácter no admitido: ${text[0]}`,line});return {statements:[],diagnostics};}
    tokens.push({text:token[0].toUpperCase(),line});index+=token[0].length;
    if(tokens.length>10000)return {statements:[],diagnostics:[{code:'ST_LIMIT',message:'El programa supera la capacidad de esta versión del editor.'}]};
  }
  tokens.push({text:'EOF',line});let at=0,depth=0;
  const byName=new Map<string,Tag>();for(const tag of tags){byName.set(tag.address,tag);if(/^[A-Z_][A-Z_0-9]*$/i.test(tag.name))byName.set(tag.name.toUpperCase(),tag);}
  const peek=()=>tokens[at]??tokens[tokens.length-1];
  const fail=(message:string):never=>{throw new Error(`Línea ${peek().line}: ${message}`);};
  const take=()=>tokens[at++];
  const expect=(s:string)=>{if(peek().text!==s)fail(`Se esperaba «${s}»; se encontró «${peek().text}».`);take();};
  const resolve=(name:string)=>{const tag=byName.get(name);if(!tag)fail(`La variable «${name}» no está declarada.`);return tag!;};
  function expression(min=0):Expr {
    if(++depth>40)fail('La expresión está demasiado anidada.');
    const token=take().text;let left:Expr;
    if(token==='('){left=expression();expect(')');}
    else if(token==='NOT'||token==='-'){const value=expression(8);if(value.type!==(token==='NOT'?'bool':'number'))fail(`Tipo incorrecto para ${token}.`);left={kind:'unary',op:token,value,type:value.type};}
    else if(token==='TRUE'||token==='FALSE')left={kind:'literal',value:token==='TRUE',type:'bool'};
    else if(/^\d/.test(token))left={kind:'literal',value:Number(token),type:'number'};
    else {const tag=resolve(token);left={kind:'ref',address:tag.address,type:tag.type};}
    while((PRECEDENCE[peek().text]??-1)>=min){const op=take().text;const right=expression(PRECEDENCE[op]+1);const boolean=['AND','OR','XOR'].includes(op),compare=['=','<>','<','>','<=','>='].includes(op);
      if(boolean&&(left.type!=='bool'||right.type!=='bool'))fail(`${op} necesita valores booleanos.`);
      if(!boolean&&!compare&&(left.type!=='number'||right.type!=='number'))fail(`${op} necesita números.`);
      if(compare&&(left.type!==right.type||!['=','<>'].includes(op)&&left.type!=='number'))fail(`Tipos incompatibles para ${op}.`);
      left={kind:'binary',op,left,right,type:boolean||compare?'bool':'number'};
    }
    depth--;return left;
  }
  function statements(stops:string[],level=0):Statement[]{
    if(level>20)fail('Demasiados condicionales anidados.');const result:Statement[]=[];
    while(peek().text!=='EOF'&&!stops.includes(peek().text)){
      if(peek().text==='IF'){take();const condition=expression();if(condition.type!=='bool')fail('IF necesita una condición booleana.');expect('THEN');const yes=statements(['ELSE','END_IF'],level+1);let no:Statement[]=[];if(peek().text==='ELSE'){take();no=statements(['END_IF'],level+1);}expect('END_IF');expect(';');result.push({kind:'if',condition,yes,no});}
      else {const tag=resolve(take().text);if(tag.address.startsWith('I')||tag.address.startsWith('AI'))fail('Las entradas se leen; usa una salida o memoria para asignar.');expect(':=');const expr=expression();if(expr.type!==tag.type)fail(`Tipo incompatible con ${tag.address}.`);expect(';');result.push({kind:'assign',address:tag.address,expr});}
    }
    return result;
  }
  try {const result=statements([]);expect('EOF');return {statements:result,diagnostics};}
  catch(error){return {statements:[],diagnostics:[{code:'ST002',message:error instanceof Error?error.message:'No se pudo compilar el programa.',line:peek().line}]};}
}
function evaluate(expr:Expr,memory:Memory):boolean|number {
  if(expr.kind==='literal')return expr.value;
  if(expr.kind==='ref')return memory[expr.address]??(expr.type==='bool'?false:0);
  if(expr.kind==='unary')return expr.op==='NOT'?!evaluate(expr.value,memory):-Number(evaluate(expr.value,memory));
  const a=evaluate(expr.left,memory),b=evaluate(expr.right,memory);
  switch(expr.op){case'AND':return !!a&&!!b;case'OR':return !!a||!!b;case'XOR':return !!a!==!!b;case'=':return a===b;case'<>':return a!==b;case'<':return a<b;case'>':return a>b;case'<=':return a<=b;case'>=':return a>=b;case'+':return Number(a)+Number(b);case'-':return Number(a)-Number(b);case'*':return Number(a)*Number(b);case'/':if(Number(b)===0)throw new Error('División por cero: ejecución detenida.');return Number(a)/Number(b);case'MOD':if(Number(b)===0)throw new Error('MOD por cero: ejecución detenida.');return Number(a)%Number(b);default:throw new Error('Operación ST desconocida.');}
}
export function runST(program:STProgram,memory:Memory):Memory {
  const result={...memory};
  function run(statements:Statement[]){for(const statement of statements)if(statement.kind==='assign'){const value=evaluate(statement.expr,result);if(typeof value==='number'&&!Number.isFinite(value))throw new Error('Resultado numérico fuera de rango.');result[statement.address]=value;}else run(evaluate(statement.condition,result)?statement.yes:statement.no);}
  run(program.statements);return result;
}
