import SectionTitle from './SectionTitle';
import ButtonLink from '../ui/ButtonLink';
import MarkdownRenderer from '../ui/MarkdownRenderer';
import {getTextAndColor} from '../../js/utils';

const WelcomeMessageView = ({
  data,
  value,
  placeholder,
  canEdit,
  onEdit,
}) => {

  const [mdtext, mdcolor] = getTextAndColor(data, value, placeholder || "No welcome message has been set");

  return (
    <div className="flex flex-col">
      <div className="flex space-x-4 items-center">
        <SectionTitle>Welcome Message:</SectionTitle>
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

export default WelcomeMessageView;
