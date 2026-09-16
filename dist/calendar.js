// One shared calendar for every player, including Eastern daylight-saving changes.
export const TIME_ZONE='America/New_York';
const formatter=new Intl.DateTimeFormat('en-US',{timeZone:TIME_ZONE,year:'numeric',month:'2-digit',day:'2-digit'});
export function dayKey(date=new Date()){
 const parts=Object.fromEntries(formatter.formatToParts(date).map(p=>[p.type,p.value]));
 return `${parts.year}-${parts.month}-${parts.day}`;
}
export function nextMidnight(date=new Date()){
 const day=dayKey(date);let low=Math.floor(date.getTime()/1000),high=low+27*3600;
 // Find the first second of the next Eastern day; a day may be 23 or 25 hours.
 while(high-low>1){const mid=Math.floor((low+high)/2);if(dayKey(new Date(mid*1000))===day)low=mid;else high=mid;}
 return high*1000;
}
