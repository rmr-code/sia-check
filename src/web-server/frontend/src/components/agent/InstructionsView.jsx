import SectionTitle from './SectionTitle';
import ButtonLink from '../ui/ButtonLink';
import MarkdownRenderer from '../ui/MarkdownRenderer';
import { getTextAndColor } from '../../js/utils';

const InstructionsView = ({
  data,
  value,
  placeholder,
  canEdit,
  onEdit,
}) => {

  
  const [mdtext, mdcolor] = getTextAndColor(data, value, placeholder || "No instructions to the model have been given");

  return (
    <div className="flex flex-col">
      <div className="flex space-x-4 items-center">
        <SectionTitle>Instructions to the model:</SectionTitle>
        {/* Call the onEdit prop when the ButtonLink is clicked */}
        { canEdit && 
          <ButtonLink size="text-md" onClick={onEdit}>
            edit
          </ButtonLink>
        }
      </div>
      <MarkdownRenderer content={mdtext} baseTextColor={mdcolor} />
    </div>
  );
};

export default InstructionsView;
