const fileUpload = require('express-fileupload');

module.exports = fileUpload({
    limits: { 
        fileSize: 10 * 1024 * 1024 // 10MB max file size
    },
    abortOnLimit: true,
    createParentPath: true
}); 