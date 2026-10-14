import api from "../../services/api";

function AssignmentFileList({ title, files = [], assignmentId, fileKind }) {
  const visibleFiles = Array.isArray(files)
    ? files.map((file, index) => ({ file, index })).filter(({ file }) => file)
    : [];

  if (visibleFiles.length === 0) return null;

  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
      <h4 className="mb-3 text-sm font-semibold text-slate-800">{title}</h4>
      <ul className="space-y-3">
        {visibleFiles.map(({ file, index }) => {
          const name = file.fileName || `Assignment PDF ${index + 1}`;
          const fileUrl = `${api.defaults.baseURL}/assignments/${assignmentId}/files/${fileKind}/${index}`;

          return (
            <li
              key={file.publicId || `${assignmentId}-${fileKind}-${index}`}
              className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="break-all text-sm text-slate-700">{name}</span>
              <div className="flex shrink-0 gap-3 text-sm font-semibold">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  Preview PDF
                </a>
                <a
                  href={`${fileUrl}?download=true`}
                  download={name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  Download PDF
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default AssignmentFileList;
