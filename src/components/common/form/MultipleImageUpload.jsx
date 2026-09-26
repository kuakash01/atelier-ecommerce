// import React, { useState, useEffect, useRef } from "react";
// import { motion } from "framer-motion";
// import { Plus, Trash2 } from "lucide-react";

// const MultipleImageUpload = ({ label, value = [], onChange, required = false, showLabel = false }) => {
//   const [previews, setPreviews] = useState([]);
//   const objectUrlsRef = useRef([]);

//   useEffect(() => {
//     // Clean up old object URLs
//     objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
//     objectUrlsRef.current = [];

//     if (!value || value.length === 0) {
//       setPreviews([]);
//       return;
//     }

//     const newPreviews = value.map(file => {
//       if (file instanceof File) {
//         const url = URL.createObjectURL(file);
//         objectUrlsRef.current.push(url);
//         return url;
//       } else if (typeof file === "string") {
//         return file;
//       }
//       return "";
//     });

//     setPreviews(newPreviews);

//     return () => {
//       objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
//     };
//   }, [value]);

//   const handleFileChange = e => {
//     const files = Array.from(e.target.files);
//     if (!files.length) return;
//     onChange([...(Array.isArray(value) ? value : []), ...files]);
//     e.target.value = "";
//   };

//   const handleRemove = index => {
//     const newFiles = [...value];
//     newFiles.splice(index, 1);
//     onChange(newFiles);
//   };

//   return (
//     <div>
//       {showLabel && label && (
//         <label className="font-medium text-sm text-gray-700 dark:text-gray-300">
//           {label} {required && <span className="text-red-400">*</span>}
//         </label>
//       )}
//       <input
//         type="file"
//         accept="image/*"
//         multiple
//         className="hidden"
//         id={`${label}-input`}
//         onChange={handleFileChange}
//       />
//       <div className="flex flex-wrap gap-3 mt-2">
//         {previews.map((src, index) => (
//           <motion.div key={index} className="relative w-28 h-28 rounded-lg overflow-hidden border border-gray-300 shadow-sm group">
//             <img src={src} alt={`preview-${index}`} className="object-cover w-full h-full" />
//             <motion.button
//               type="button"
//               onClick={() => handleRemove(index)}
//               className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
//             >
//               <Trash2 size={14} />
//             </motion.button>
//           </motion.div>
//         ))}
//         <motion.label
//           htmlFor={`${label}-input`}
//           whileHover={{ scale: 1.1 }}
//           className="w-28 h-28 flex items-center justify-center border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:bg-gray-100"
//         >
//           <Plus className="w-6 h-6 text-gray-500" />
//         </motion.label>
//       </div>
//     </div>
//   );
// };

// export default MultipleImageUpload;









// import React, { useEffect, useState, useRef } from "react";
// import { Plus, Trash2, Upload } from "lucide-react";

// export default function ImageUpload({
//   label,
//   value = [],
//   onChange,
//   multiple = false,
//   required = false,
//   showLabel = false,
// }) {
//   const inputRef = useRef(null);
//   const [previews, setPreviews] = useState([]);

//   // Convert incoming value → previewable format
//   useEffect(() => {
//     const mapped = value.map((item) => {
//       if (item?.file) {
//         return {
//           ...item,
//           preview: URL.createObjectURL(item.file),
//         };
//       }
//       return {
//         ...item,
//         preview: item.url,
//       };
//     });

//     setPreviews(mapped);
//   }, [value]);

//   const handleFileSelect = (e) => {
//     const files = Array.from(e.target.files);

//     const mapped = files.map((file) => ({
//       file,
//       preview: URL.createObjectURL(file),
//       _id: null,
//       url: null,
//       public_id: null,
//     }));

//     if (multiple) {
//       onChange([...(value || []), ...mapped]);
//     } else {
//       onChange(mapped);
//     }
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     const files = Array.from(e.dataTransfer.files);

//     const mapped = files.map((file) => ({
//       file,
//       preview: URL.createObjectURL(file),
//     }));

//     if (multiple) {
//       onChange([...(value || []), ...mapped]);
//     } else {
//       onChange(mapped);
//     }
//   };

//   const removeImage = (index) => {
//     const updated = value.filter((_, i) => i !== index);
//     onChange(updated);
//   };

//   return (
//     <div className="w-full space-y-3">
//       {showLabel && label && (
//         <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
//       )}

//       {/* Upload box */}
//       <div
//         onClick={() => inputRef.current.click()}
//         onDragOver={(e) => e.preventDefault()}
//         onDrop={handleDrop}
//         className="border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer 
//                    hover:border-gray-400 transition flex flex-col items-center"
//       >
//         <Upload size={32} className="text-gray-500 mb-2" />
//         <p className="text-gray-600 text-sm">
//           Drag & drop images or click to upload
//         </p>

//         <input
//           type="file"
//           multiple={multiple}
//           required={required}
//           ref={inputRef}
//           onChange={handleFileSelect}
//           className="hidden"
//           accept="image/*"
//         />
//       </div>

//       {/* Preview grid */}
//       {previews.length > 0 && (
//         <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-4">
//           {previews.map((img, index) => (
//             <div
//               key={index}
//               className="relative rounded-lg overflow-hidden group border"
//             >
//               <img
//                 src={img.preview}
//                 alt="preview"
//                 className="w-full h-32 object-cover"
//               />

//               <button
//                 type="button"
//                 onClick={() => removeImage(index)}
//                 className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded opacity-0 
//                            group-hover:opacity-100 transition"
//               >
//                 <Trash2 size={16} />
//               </button>

//               {img.public_id && (
//                 <span className="absolute bottom-1 left-1 bg-black/50 text-white px-2 text-[10px] rounded">
//                   existing
//                 </span>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }








import React, { useEffect, useState, useRef } from "react";
import { Plus, Trash2, Upload, GripVertical } from "lucide-react";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

function SortableImage({ img, index, removeImage }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: img.preview });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative rounded-lg overflow-hidden group border"
    >
      <img
        src={img.preview}
        alt="preview"
        className="w-full object-cover"
      />

      {/* remove button */}
      <button
        type="button"
        onClick={() => removeImage(index)}
        className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded opacity-0 
                   group-hover:opacity-100 transition"
      >
        <Trash2 size={16} />
      </button>

      {/* drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute bottom-2 left-2 bg-white/80 px-2 py-1 rounded text-[11px] 
                   flex items-center gap-1 shadow cursor-grab active:cursor-grabbing"
      >
        <GripVertical size={12} />
        Move
      </div>

      {img.public_id && (
        <span className="absolute bottom-1 right-1 bg-black/50 text-white px-2 text-[10px] rounded">
          existing
        </span>
      )}
    </div>
  );
}

export default function ImageUpload({
  label,
  value = [],
  onChange,
  multiple = false,
  required = false,
  showLabel = false,
}) {
  const inputRef = useRef(null);
  const [previews, setPreviews] = useState([]);

  const sensors = useSensors(useSensor(PointerSensor));

  // Convert incoming value into previewable format
  useEffect(() => {
    const mapped = value.map((item) => {
      if (item?.file) {
        return {
          ...item,
          preview: URL.createObjectURL(item.file),
        };
      }
      return {
        ...item,
        preview: item.url,
      };
    });

    setPreviews(mapped);
  }, [value]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    const mapped = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      _id: null,
      url: null,
      public_id: null,
    }));

    if (multiple) {
      onChange([...(value || []), ...mapped]);
    } else {
      onChange(mapped);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);

    const mapped = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    if (multiple) {
      onChange([...(value || []), ...mapped]);
    } else {
      onChange(mapped);
    }
  };

  const removeImage = (index) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = previews.findIndex((i) => i.preview === active.id);
    const newIndex = previews.findIndex((i) => i.preview === over.id);

    const newOrder = arrayMove(value, oldIndex, newIndex);

    onChange(newOrder);
  };

  return (
    <div className="w-full space-y-3">
      {showLabel && label && (
        <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
      )}

      {/* Upload box */}
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer 
                   hover:border-gray-400 transition flex flex-col items-center"
      >
        <Upload size={32} className="text-gray-500 mb-2" />
        <p className="text-gray-600 text-sm">
          Drag & drop images or click to upload
        </p>

        <input
          type="file"
          multiple={multiple}
          required={required}
          ref={inputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*"
        />
      </div>

      {/* Preview grid with sorting */}
      {previews.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={previews.map((p) => p.preview)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-4">
              {previews.map((img, index) => (
                <SortableImage
                  key={img.preview}
                  img={img}
                  index={index}
                  removeImage={removeImage}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
