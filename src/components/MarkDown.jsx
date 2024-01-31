import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// render the html 
const Markdown = ({ content }) => (
    <ReactMarkdown
        className="prose mt-1 w-full break-words prose-p:leading-relaxed"
        remarkPlugins={[remarkGfm]}
        components={{
            a: ({ node, ...props }) => <a {...props} style={{ color: "blue", fontWeight: "bold" }} />,
        }}
    >
        {content}
    </ReactMarkdown>
);



export default Markdown;