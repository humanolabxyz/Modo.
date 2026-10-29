export const PHONE_VIEWPORT_QUERY='(pointer: coarse) and (max-width: 520px), (pointer: coarse) and (max-height: 520px) and (max-width: 1000px)';
export const isPhoneViewport=()=>typeof window!=='undefined'&&matchMedia(PHONE_VIEWPORT_QUERY).matches;
