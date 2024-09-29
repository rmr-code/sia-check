import ButtonLink from '../ui/ButtonLink';
import { getTextAndColor } from '../../js/utils';

const NameView = ({
  data,
  value,
  placeholder,
  className,
  canEdit,
  onEdit,
}) => {


  
  const [mdtext, mdcolor] = getTextAndColor(data, value, placeholder || "");

  return (
    <div className={`flex space-x-2 items-center ${className || ''}`}>
      <div className="text-2xl font-semibold text-gray-400">Agent:</div>
      <div className={`text-2xl font-medium ${mdcolor}`}>{mdtext}</div>
      {/* Call the onEdit prop when the ButtonLink is clicked */}
      {canEdit && !data && <ButtonLink size="px-2 text-md" onClick={onEdit}>edit </ButtonLink> }
    </div>
  );
};

export default NameView;
