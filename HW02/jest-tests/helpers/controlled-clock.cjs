// Optional instrumentation for exact coupon-expiry tests. Inactive unless a clock file contains an ISO timestamp.
const fs=require('fs');const RealDate=Date;
const now=()=>{try{const value=fs.readFileSync(process.env.HW02_CLOCK_FILE,'utf8').trim();if(value)return RealDate.parse(value);}catch{}return RealDate.now();};
class ControlledDate extends RealDate{constructor(...a){super(...(a.length?a:[now()]));}static now(){return now();}}
global.Date=ControlledDate;
