import { useEffect, useState } from "react";
// @ts-ignore
import { WithContext as ReactTags } from "react-tag-input";
// @ts-ignore
import type { Tag as TagProp } from "react-tag-input/dist/components/SingleTag";
import Tags from "@/constants/tags";

interface TagProps {
  id: string;
  text: string;
  className?: string;
}
const KeyCodes = {
  comma: 188,
  enter: 13,
};

const suggestions = Tags.map((tag) => {
  return {
    id: tag,
    text: tag,
    className: "",
  };
});

const delimiters = [KeyCodes.comma, KeyCodes.enter];

const TagInput = ({
  disabled,
  onChange,
  questionTags,
}: {
  disabled: boolean;
  onChange: (value: TagProps[]) => void;
  questionTags: TagProps[];
}) => {
  const [tags, setTags] = useState<TagProps[]>(
    questionTags ? questionTags.map((t) => ({ ...t, className: t.className ?? "" })) : []
  );

  const handleDelete = (i: number) => {
    if (disabled) return;
    setTags(tags.filter((tag, index) => index !== i));
  };

  const handleAddition = (tag: any) => {
    if (disabled) return;
    const normalized: TagProps = {
      id: tag.id,
      text: tag.text ?? tag?.name ?? "",
      className: tag.className ?? "",
    };
    setTags([...tags, normalized]);
  };

  const handleDrag = (tag: TagProp, currPos: number, newPos: number) => {
    if (disabled) return;
    const newTags = tags.slice();

    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag);

    // re-render
    setTags(newTags);
  };

  useEffect(() => {
    onChange(tags);
    // console.log(tags);
  }, [tags, onChange]);

  return (
    <ReactTags
      tags={tags as any}
      suggestions={suggestions}
      delimiters={delimiters}
      handleDelete={handleDelete}
      handleAddition={handleAddition}
      handleDrag={handleDrag}
      inputFieldPosition="bottom"
      autocomplete
      maxTags={8}
      // {...field}
      // onBlur={field.onBlur} c
      classNames={{
        tag: "inline-flex items-center rounded-md border px-2.5 py-2 gap-2 ml-2 mb-2 background-light900_dark300 p-2",
        tagInput:
          "paragraph-regular background-light900_dark300 text-dark300_light700 min-h-[56px] w-full border light-border-2 rounded-md",
        tagInputField:
          "paragraph-regular background-light900_dark300 text-dark300_light700 min-h-[56px] w-full pl-3 border light-border-2 rounded-md",
        suggestions:
          "paragraph-regular background-light900_dark300 text-dark300_light700 min-h-[56px] w-full rounded-md",
        activeSuggestion:
          "background-light700_dark400 cursor-pointer underline",
      }}
    />
  );
};

export default TagInput;
