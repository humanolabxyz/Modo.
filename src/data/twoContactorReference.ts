// Related conductors on the unchanged received reference. These are drawing
// anchors, not claims that its original labels are terminals on the 37-wire bank.
// In particular the delta feed in that drawing is upstream of its line contactor.
export const referencePort=(object:number,terminal:string)=>`reference:${object}:${terminal}`;
const pairs:[number,string,number,string][]=[
 [53,'2',54,'95'],[54,'96',55,'11'],[55,'12',56,'13'],
 [56,'13',57,'13'],[56,'14',57,'14'],[57,'14',63,'A1'],[63,'A2',52,'N'],
 [57,'14',58,'11'],[58,'12',59,'11'],[59,'12',64,'A1'],[64,'A2',52,'N'],
 [57,'14',58,'13'],[58,'14',61,'11'],[61,'12',65,'A1'],[65,'A2',52,'N'],
 [2,'4',3,'3'],[2,'6',3,'5'],[4,'2',5,'U1'],[4,'4',5,'V1'],[4,'6',5,'W1'],
 [5,'W2',7,'6'],[5,'U2',7,'4'],[5,'V2',7,'2'],[7,'1',7,'3'],[7,'3',7,'5'],
 [2,'2',6,'1'],[2,'4',6,'3'],[2,'6',6,'5'],
 [6,'6',5,'W2'],[6,'4',5,'U2'],[6,'2',5,'V2'],
 [69,'X2',52,'N'],[64,'A1',67,'X1'],[65,'A1',68,'X1'],
 [2,'2',3,'1'],[53,'2',54,'97'],[54,'98',69,'X1'],
];
export const TWO_CONTACTOR_REFERENCE_PAIRS=pairs.map(([a,b,c,d])=>[referencePort(a,b),referencePort(c,d)] as [string,string]);
