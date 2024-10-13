// Create a task graph for the specified tasks and open it in the default image viewer.
// Usage: tsx scripts/create-task-graph.ts [graph-file] [tasks...]
import shell from 'shelljs';

const graphFile = process.argv[2] || 'task-graph.png';
const tasks = process.argv.slice(3).join(' ');

shell.exec(`turbo run ${tasks} --graph=${graphFile} && open ${graphFile}`);
