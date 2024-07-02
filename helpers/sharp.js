const sharp = require('sharp');
const fs = require('fs')
const resizeImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  
  
  try {
    
    const inputFilePath = req.file.path;

    const resizedImage = await sharp(req.file.path)
      .resize(400, 400) // Resize the image to 640x480 pixels
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toBuffer(
        (err, processedImageBuffer) => {
          if (err) {
            console.error('Error while cropping the image:', err);
            next(err); 
        } else {
            fs.writeFile(inputFilePath, processedImageBuffer, (writeErr) => {
                if (writeErr) {
                    console.error('Error while saving the processed image:', writeErr);
                    next(writeErr); 
                } else {
                    console.log('Image cropped and saved successfully to:', inputFilePath);
                    next();
                }
            });
        }
        }
      );

    req.file.buffer = resizedImage;
   // next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  resizeImage
}; 
