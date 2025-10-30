import { useEffect, useState } from 'react';

/**
 * Simple Markdown Renderer Component
 * Converts markdown content to HTML for display
 */
const MarkdownRenderer = ({ filePath }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMarkdown = async () => {
      try {
        const response = await fetch(filePath);
        const text = await response.text();
        const html = convertMarkdownToHtml(text);
        setContent(html);
        setLoading(false);
      } catch (error) {
        console.error('Error loading markdown:', error);
        setContent('<p class="text-red-600">Failed to load content.</p>');
        setLoading(false);
      }
    };

    loadMarkdown();
  }, [filePath]);

  // Simple markdown to HTML converter
  const convertMarkdownToHtml = (markdown) => {
    let html = markdown;

    // Headers (h1-h4)
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mt-6 mb-4">$1</h1>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-gray-900 mt-5 mb-3">$1</h2>');
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">$1</h3>');
    html = html.replace(/^#### (.*$)/gim, '<h4 class="text-base font-semibold text-gray-800 mt-3 mb-2">$1</h4>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-gray-900">$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>');

    // Horizontal rule
    html = html.replace(/^---$/gim, '<hr class="my-6 border-t border-gray-300" />');

    // Bullet lists
    html = html.replace(/^\- (.*$)/gim, '<li class="ml-6 mb-2 list-disc text-gray-700">$1</li>');
    html = html.replace(/(<li.*<\/li>)/s, '<ul class="space-y-1 mb-4">$1</ul>');

    // Line breaks
    html = html.replace(/\n\n/g, '</p><p class="text-gray-700 mb-4 leading-relaxed">');
    
    // Wrap in paragraph if not already in a tag
    if (!html.startsWith('<')) {
      html = '<p class="text-gray-700 mb-4 leading-relaxed">' + html + '</p>';
    }

    return html;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-gray-600">Loading content...</span>
      </div>
    );
  }

  return (
    <div 
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default MarkdownRenderer;

