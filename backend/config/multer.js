import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir=process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.join(__dirname,'../uploads/documents');
if (!fs.existsSync(uploadDir)){
   fs.mkdirSync(uploadDir,{recursive:true});
}

//configure multer storage
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,uploadDir); 
    },
    filename:(req,file,cb)=>{
        const uniqueSuffix=Date.now()+'-'+Math.round(Math.random()*1E9);
        const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, `${uniqueSuffix}-${safeOriginalName}`);
    }
});

// file filter - only PDF files allowed
const fileFilter=(req,file,cb)=>{
    const ext = path.extname(file.originalname).toLowerCase();
    if(file.mimetype==='application/pdf' && ext === '.pdf'){
        cb(null,true);
    }else{
        cb(new Error('Only PDF files are allowed'),false);
    }
};


// configure multer upload
const upload=multer({
    storage:storage,
    fileFilter:fileFilter,
    limits:{fileSize:parseInt(process.env.MAX_FILE_SIZE)||10*1024*1024} //10MB limit
});


export default upload;
