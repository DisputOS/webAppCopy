/**
 * Генерує PDF через CloudConvert API.
 * Треба змінна середовища CLOUDCONVERT_API_KEY.
 */
export async function generatePDF(
  plainText: string,
  caseId: string
): Promise<Buffer> {
  const apiKey = process.env.CLOUDCONVERT_API_KEY;
  if (!apiKey) throw new Error('CLOUDCONVERT_API_KEY is not set');

  // 1. Створюємо завдання конвертації TXT -> PDF
  const jobRes = await fetch('https://api.cloudconvert.com/v2/jobs', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tasks: {
        'import-raw': {
          operation: 'import/raw',
          file: Buffer.from(plainText).toString('base64'),
          filename: `case_${caseId}.txt`
        },
        'convert': {
          operation: 'convert',
          input: ['import-raw'],
          output_format: 'pdf'
        },
        'export-url': {
          operation: 'export/url',
          input: ['convert']
        }
      }
    })
  }).then(r => r.json());

  const exportTask = jobRes?.data?.tasks?.find(
    (t: any) => t.name === 'export-url'
  );

  // 2. Чекаємо завершення експорту
  const taskId = exportTask.id;
  let fileUrl: string | undefined;

  for (let i = 0; i < 20; i++) {
    const status = await fetch(
      `https://api.cloudconvert.com/v2/tasks/${taskId}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` }
      }
    ).then(r => r.json());

    if (status.data.status === 'finished') {
      fileUrl = status.data.result.files[0].url;
      break;
    }
    await new Promise(res => setTimeout(res, 1500)); // подождать 1.5 с и проверить снова
  }

  if (!fileUrl) throw new Error('CloudConvert job did not finish in time');

  // 3. Скачуємо PDF і повертаємо буфер
  const pdfArrayBuffer = await fetch(fileUrl).then(r => r.arrayBuffer());
  return Buffer.from(pdfArrayBuffer);
}
