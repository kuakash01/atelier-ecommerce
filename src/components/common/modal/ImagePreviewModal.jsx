// import React from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { X } from "lucide-react";

// const ImagePreviewModal = ({ show, onClose, thumbnail, gallery }) => {
//   return (
//     <AnimatePresence>
//       {show && (
//         <>
//           {/* Overlay */}
//           <motion.div
//             className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           />

//           {/* Modal */}
//           <motion.div
//             className="fixed inset-0 flex items-center justify-center z-50 p-4"
//             initial={{ opacity: 0, scale: 0.9, y: 30 }}
//             animate={{ opacity: 1, scale: 1, y: 0 }}
//             exit={{ opacity: 0, scale: 0.9, y: 30 }}
//           >
//             <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
              
//               {/* Header (fixed) */}
//               <div className="sticky top-0 z-10 bg-white px-6 py-4 shadow flex items-center justify-between">
//                 <h2 className="text-2xl font-semibold text-gray-800">
//                   Image Preview
//                 </h2>
//                 <button
//                   onClick={onClose}
//                   className="text-gray-500 hover:text-gray-800 transition cursor-pointer"
//                 >
//                   <X size={24} />
//                 </button>
//               </div>

//               {/* Scrollable Content */}
//               <div className="p-6 overflow-y-auto">
//                 {/* Thumbnail */}
//                 {thumbnail && (
//                   <div className="mb-6">
//                     <p className="text-sm text-gray-600 mb-2 font-medium">
//                       Thumbnail
//                     </p>
//                     <img
//                       src={thumbnail}
//                       alt="Thumbnail"
//                       className="w-40 h-40 object-cover rounded-xl border shadow-sm"
//                     />
//                   </div>
//                 )}

//                 {/* Gallery */}
//                 {gallery && gallery.length > 0 && (
//                   <div>
//                     <p className="text-sm text-gray-600 mb-2 font-medium">
//                       Gallery Images
//                     </p>
//                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
//                       {gallery.map((img, i) => (
//                         <img
//                           key={i}
//                           src={img}
//                           alt={`Gallery ${i + 1}`}
//                           className="w-full object-cover aspect-square rounded-xl border shadow-sm hover:scale-105 transition-transform"
//                         />
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </motion.div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// };

// export default ImagePreviewModal;



import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const ImagePreviewModal = ({ show, onClose, thumbnail, gallery }) => {
  const [fullImage, setFullImage] = useState(null);

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={fullImage ? () => setFullImage(null) : undefined}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
          >
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
              {/* Header (fixed) */}
              <div className="sticky top-0 z-10 bg-white px-6 py-4 shadow flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Image Preview
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-800 transition cursor-pointer"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto">
                {/* Thumbnail */}
                {thumbnail && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2 font-medium">
                      Thumbnail
                    </p>
                    <img
                      src={thumbnail}
                      alt="Thumbnail"
                      onClick={() => setFullImage(thumbnail)}
                      className="w-40 h-40 object-cover rounded-xl border shadow-sm hover:scale-105 transition-transform cursor-zoom-in"
                    />
                  </div>
                )}

                {/* Gallery */}
                {gallery && gallery.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2 font-medium">
                      Gallery Images
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {gallery.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`Gallery ${i + 1}`}
                          onClick={() => setFullImage(img)}
                          className="w-full object-cover aspect-square rounded-xl border shadow-sm hover:scale-105 transition-transform cursor-zoom-in"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Full Image Overlay */}
          <AnimatePresence>
            {fullImage && (
              <>
                <motion.div
                  className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setFullImage(null)}
                />
                <motion.div
                  className="fixed inset-0 flex items-center justify-center z-[70] p-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <div className="relative">
                    <img
                      src={fullImage}
                      alt="Full View"
                      className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl object-contain"
                    />
                    <button
                      onClick={() => setFullImage(null)}
                      className="absolute top-4 right-4 bg-white/70 hover:bg-white text-gray-800 rounded-full p-2 shadow-md transition"
                    >
                      <X size={22} />
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};

export default ImagePreviewModal;
