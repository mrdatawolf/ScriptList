"use client";

interface ScriptReadmeProps {
  content: string;
}

export function ScriptReadme({ content }: ScriptReadmeProps) {
  return (
    <div className="prose prose-invert max-w-none">
      {content.split('\n').map((line, i) => (
        <div key={i}>
          {line.startsWith('#') ? (
            <h2 className="text-2xl font-bold mb-4 text-blue-100">{line.replace('# ', '')}</h2>
          ) : line.startsWith('- ') ? (
            <li className="ml-4 text-blue-200/80">{line.replace('- ', '')}</li>
          ) : (
            <p className="text-blue-200/80">{line}</p>
          )}
        </div>
      ))}
    </div>
  );
}