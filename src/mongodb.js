const mongoose=require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/sensor')

.then(()=>{
console.log('mongodb connected');
})
.catch((error)=>{
    console.log('connection failed',error);
});

const Myvar_tim=new mongoose.Schema({
    
    file_name:{
        type:String,
    },
    s3URL:{
        type:String,
    },
    date:{
        type:Date,
        default:Date.now,
    }
});

const collection=new mongoose.model('mycollection',Myvar_tim);

module.exports=collection