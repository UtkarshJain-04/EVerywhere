const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const config = require('../config/env');

// Resolve path to rec_engine.py
function resolveScriptPath() {
  const possiblePaths = [
    path.resolve(__dirname, '..', '..', 'recom_model', 'rec_engine.py'),
    path.resolve(__dirname, '..', '..', 'recom_model', 'recom_model', 'rec_engine.py'),
    path.resolve(process.cwd(), 'recom_model', 'rec_engine.py'),
    path.resolve(process.cwd(), 'recom_model', 'recom_model', 'rec_engine.py'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return possiblePaths[0];
}

// Resolve path to charging_stations.xlsx
function resolveExcelPath() {
  const possiblePaths = [
    path.resolve(__dirname, '..', '..', 'recom_model', 'charging_stations.xlsx'),
    path.resolve(__dirname, '..', '..', 'recom_model', 'recom_model', 'charging_stations.xlsx'),
    path.resolve(process.cwd(), 'recom_model', 'charging_stations.xlsx'),
    path.resolve(process.cwd(), 'recom_model', 'recom_model', 'charging_stations.xlsx'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return possiblePaths[0];
}

/**
 * Executes the Python recommendation engine as a safe subprocess.
 * Communicates via JSON over stdin/stdout to prevent shell injection.
 */
function getPythonRecommendations(userQuery) {
  return new Promise((resolve, reject) => {
    const scriptPath = resolveScriptPath();
    const excelPath = resolveExcelPath();

    if (!fs.existsSync(scriptPath)) {
      return reject(new Error(`Python recommendation script not found at ${scriptPath}`));
    }

    const pythonExecutable = config.pythonPath || 'python';
    const args = [scriptPath, '--stdin', '--excel', excelPath];

    const child = spawn(pythonExecutable, args, {
      env: {
        ...process.env,
        PYTHONIOENCODING: 'utf-8',
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdoutData = '';
    let stderrData = '';
    let timedOut = false;

    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
      reject(new Error('Recommendation engine process timed out after 10000ms.'));
    }, 10000);

    child.stdout.setEncoding('utf-8');
    child.stderr.setEncoding('utf-8');

    child.stdout.on('data', (chunk) => {
      stdoutData += chunk;
    });

    child.stderr.on('data', (chunk) => {
      stderrData += chunk;
    });

    child.on('error', (err) => {
      clearTimeout(timeout);
      if (!timedOut) {
        reject(new Error(`Failed to spawn Python process (${pythonExecutable}): ${err.message}`));
      }
    });

    child.on('close', (code) => {
      clearTimeout(timeout);
      if (timedOut) return;

      if (code !== 0) {
        return reject(
          new Error(`Python process exited with code ${code}. Stderr: ${stderrData || 'None'}`)
        );
      }

      try {
        const parsed = JSON.parse(stdoutData.trim());
        resolve(parsed);
      } catch (parseErr) {
        reject(
          new Error(`Failed to parse recommendation output as JSON: ${parseErr.message}. Output was: ${stdoutData.substring(0, 200)}`)
        );
      }
    });

    // Write input JSON safely to stdin
    try {
      child.stdin.write(JSON.stringify(userQuery));
      child.stdin.end();
    } catch (writeErr) {
      clearTimeout(timeout);
      reject(new Error(`Failed to write query to Python process stdin: ${writeErr.message}`));
    }
  });
}

module.exports = {
  getPythonRecommendations,
  resolveScriptPath,
  resolveExcelPath,
};
