import SectionTitle from './SectionTitle';
import ButtonLink from '../ui/ButtonLink';
import MarkdownRenderer from '../ui/MarkdownRenderer';
import { getTextAndColor } from '../../js/utils';

// Function to convert a comma-delimited string to a markdown string
const commaDelimitedStringToMarkdown = (input) => {
  if (typeof input !== 'string' || !input.trim()) {
    return 'No suggested prompts have been set'; // Return blank if the input is not a string or is blank
  }
  
  const items = input.split(',').map(item => item.trim().replace(/^"|"$/g, ''));
  let markdown = 'The following are your suggested prompts:\n\n';
  items.forEach((item, index) => {
    markdown += `${index + 1}. ${item}\n`;
  });
  return markdown.trim();
};
const SuggestedPromptsView = ({
  data,
  value,
  placeholder,
  canEdit,
  onEdit,
}) => {


  // store the md text
  const [mdtext, mdcolor] = getTextAndColor(data, value, placeholder || "");
  const newmdtext = commaDelimitedStringToMarkdown(mdtext);

  return (
    <div className="flex flex-col">
      <div className="flex space-x-4 items-center">
        <SectionTitle>Suggested Prompts:</SectionTitle>
        { canEdit && 
          <ButtonLink size="text-md" onClick={onEdit}>
            edit
          </ButtonLink>
        }
      </div>
      <MarkdownRenderer content={newmdtext} baseTextColor={mdcolor} />
    </div>
  );
};

export default SuggestedPromptsView;
