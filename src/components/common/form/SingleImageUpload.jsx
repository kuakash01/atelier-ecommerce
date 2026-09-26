// import React, { useState, useEffect, useRef } from "react";
// import { motion } from "framer-motion";
// import { Plus, Trash2 } from "lucide-react";

// const SingleImageUpload = ({ label, value = null, onChange, required = false }) => {
//   const [preview, setPreview] = useState(null);
//   const objectUrlRef = useRef(null);

//   useEffect(() => {
//     // Revoke old object URL
//     if (objectUrlRef.current) {
//       URL.revokeObjectURL(objectUrlRef.current);
//       objectUrlRef.current = null;
//     }

//     if (!value) {
//       setPreview(null);
//       return;
//     }

//     let src = "";
//     if (value instanceof File) {
//       src = URL.createObjectURL(value);
//       objectUrlRef.current = src; // track it for cleanup
//     } else if (typeof value === "string") {
//       src = value;
//     }

//     setPreview(src);

//     return () => {
//       if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
//     };
//   }, [value]);

//   const handleFileChange = e => {
//     const file = e.target.files[0];
//     if (file) onChange(file);
//     e.target.value = "";
//   };

//   const handleRemove = () => {
//     onChange(null);
//   };

//   return (
//     <div>
//       {label && (
//         <label className="font-medium text-sm text-gray-700 dark:text-gray-300">
//           {label} {required && <span className="text-red-400">*</span>}
//         </label>
//       )}
//       <input
//         type="file"
//         accept="image/*"
//         className="hidden"
//         id={`${label}-input`}
//         onChange={handleFileChange}
//       />
//       <div className="flex flex-wrap gap-3 mt-2">
//         {preview ? (
//           <motion.div className="relative w-28 h-28 rounded-lg overflow-hidden border border-gray-300 shadow-sm group">
//             <img src={preview} alt="preview" className="object-cover w-full h-full" />
//             <motion.button
//               type="button"
//               onClick={handleRemove}
//               className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
//             >
//               <Trash2 size={14} />
//             </motion.button>
//           </motion.div>
//         ) : (
//           <motion.label
//             htmlFor={`${label}-input`}
//             whileHover={{ scale: 1.1 }}
//             className="w-28 h-28 flex items-center justify-center border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:bg-gray-100"
//           >
//             <Plus className="w-6 h-6 text-gray-500" />
//           </motion.label>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SingleImageUpload;









import React, { useState, useEffect, useRef, useId } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";

const SingleImageUpload = ({ label, value = null, onChange, required = false }) => {
  const [preview, setPreview] = useState(null);
  const objectUrlRef = useRef(null);
  const inputId = useId(); // ✅ unique id

  useEffect(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (!value) {
      setPreview(null);
      return;
    }

    let src = "";
    if (value instanceof File) {
      src = URL.createObjectURL(value);
      objectUrlRef.current = src;
    } else if (typeof value === "string") {
      src = value;
    }

    setPreview(src);

    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, [value]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) onChange(file);
    e.target.value = "";
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <div>
      {label && (
        <label
          htmlFor={inputId}
          className="font-medium text-sm text-gray-700 dark:text-gray-300"
        >
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}

      <input
        type="file"
        accept="image/*"
        className="hidden"
        id={inputId} // ✅ unique
        onChange={handleFileChange}
      />

      <div className="flex flex-wrap gap-3 mt-2">
        {preview ? (
          <motion.div className="relative w-28 h-28 rounded-lg overflow-hidden border border-gray-300 shadow-sm group">
            <img
              src={preview}
              alt="preview"
              className="object-cover w-full h-full"
            />

            <motion.button
              type="button"
              onClick={handleRemove}
              className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={14} />
            </motion.button>
          </motion.div>
        ) : (
          <motion.label
            htmlFor={inputId} // ✅ match
            whileHover={{ scale: 1.1 }}
            className="w-28 h-28 flex items-center justify-center border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:bg-gray-100"
          >
            <Plus className="w-6 h-6 text-gray-500" />
          </motion.label>
        )}
      </div>
    </div>
  );
};

export default SingleImageUpload;