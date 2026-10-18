const path=require('path');
const sut=process.env.HW02_SUT||path.resolve(__dirname,'../../../eshop-sut');
function dependency(name){
 const roots=[path.resolve(__dirname,'..'),path.join(sut,'testing'),path.join(sut,'backend'),process.env.HW02_NODE_MODULES||'C:/Users/tung1/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'];
 for(const root of roots){try{return require(require.resolve(name,{paths:[root]}));}catch(e){if(e.code!=='MODULE_NOT_FOUND')throw e;}}
 throw new Error(`Missing dependency ${name}. Run npm install in jest-tests.`);
}
module.exports={dependency,sut};
