interface OGTag {
  og_image?: string;
  og_title: string;
  og_description: string;
  og_tag_link: string;
}

interface OGTagProps {
  ogTags: OGTag[];
}

export default function OGTag({ ogTags }: OGTagProps) {
  if (!ogTags || ogTags.length === 0) return null;

  return (
    <div className="max-w-[600px]">
      {ogTags.map((og, index) => (
        <div
          key={index}
          className="rounded-lg overflow-hidden bg-gray-100 dark:bg-[rgb(35,45,67)] shadow-sm"
        >
          {og.og_image && (
            <img src={og.og_image} alt={og.og_title} className="w-full h-32 object-cover" />
          )}
          <div className="p-3">
            <h3 className="font-medium text-sm text-gray-800 dark:text-gray-100 line-clamp-2 mb-1">
              {og.og_title}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 mb-1">
              {og.og_description}
            </p>
            <a
              href={og.og_tag_link}
              target="_blank"
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              {og.og_tag_link}
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
