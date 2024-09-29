import SectionTitle from './SectionTitle';
import ButtonLink from '../ui/ButtonLink';

const FilesView = ({
  files,
  new_files,
  deleted_files,
  placeholder,
  canEdit,
  onEdit,
}) => {

  // Function to convert a comma-delimited string to a array of string
  const files_arr = files ? files.split(',').map(file => file.trim().replace(/^"|"$/g, '')) : [];
  const deleted_files_arr = deleted_files ? deleted_files.split(',').map(file => file.trim().replace(/^"|"$/g, '')) : [];

  return (
    <div className="flex flex-col">
      <div className="flex space-x-4 items-center">
        <SectionTitle>Files:</SectionTitle>
        {canEdit && <ButtonLink onClick={onEdit}>edit</ButtonLink> }
      </div>
      <div>
         {/* The message line */}
        {placeholder ? (
         <div className="text-base text-gray-400">{placeholder}</div> 
        ) :
        !files && new_files.length == 0 ? (
          <div className="text-base text-gray-800">No files have been uploaded for this event.</div>
        ) : (
          <div className="text-base text-gray-800 mb-4">The following are the files:</div>
        )}
        <div className="flex flex-col">
         {/* loop through files object */}
         { files_arr.map((file, index) => {
          const isDeleted = deleted_files_arr.includes(file);
          if(isDeleted) {
            return (
              <div key={index} className="px-2 text-base text-blue-700 line-through">
                {index+1}. {file}
              </div>
            )  
          }
          else {
          return (
            <div key={index} className="px-2 text-base text-gray-800">
              {index+1}. {file}
            </div>
          )
        }
         })}
         { new_files.map((file, index) => {
          return (
            <div key={index} className="px-2 text-base text-blue-700">
              {files_arr.length + index + 1 }. {file.name}
            </div>  
          )
         })}
         </div>
      </div>
    </div>
  );
};

export default FilesView;
