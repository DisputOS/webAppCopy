/*
Stages: initiated → proof_collected → proof_ready → template_ready → pdf_ready → closed [oai_citation:0‡file-6awepulms4ym1z72yc3evz](file://file-6AWEpULms4YM1Z72YC3eVz#:~:text=%D0%A1%D1%82%D1%80%D1%83%D0%BA%D1%82%D1%83%D1%80%D0%B0%20%D1%81%D1%82%D0%B0%D1%82%D1%83%D1%81%D1%96%D0%B2%3A%201,%D1%83%D1%81%D0%BF%D1%96%D1%88%D0%BD%D0%BE%20%D0%B0%D0%B1%D0%BE%20%D0%B7%20%D0%BA%D0%BE%D0%BC%D0%B5%D0%BD%D1%82%D0%B0%D1%80%D0%B5%D0%BC).
Log events: create_dispute, attach_proof, generate_template, generate_pdf, close_case [oai_citation:1‡file-ybvhplkvwozwdqmmjamwjr](file://file-YbVhpLkVwoZWdqmMJAMwJR#:~:text=1.%20%D0%A1%D1%82%D0%B2%D0%BE%D1%80%D0%B5%D0%BD%D0%BD%D1%8F%20%D0%B4%D0%B8%D1%81%D0%BF%D1%83%D1%82%D1%83%20,action_taken%3A%20create_dispute) [oai_citation:2‡file-ybvhplkvwozwdqmmjamwjr](file://file-YbVhpLkVwoZWdqmMJAMwJR#:~:text=4.%20%D0%93%D0%B5%D0%BD%D0%B5%D1%80%D0%B0%D1%86%D1%96%D1%8F%20GPT%20%D1%88%D0%B0%D0%B1%D0%BB%D0%BE%D0%BD%D1%83%20,action_taken%3A%20generate_template).
Template example: 'Unauthorized charge after free trial...' [oai_citation:3‡file-3gfy7tj5nxuizeflgpuwxf](file://file-3Gfy7tj5NxUiZEFLgPUWxF#:~:text=%D0%A8%D0%B0%D0%B1%D0%BB%D0%BE%D0%BD%20,after%20free%20trial).
PDF metadata fields: file_url, template_used, language, watermark_applied [oai_citation:4‡file-vyahyiihyada5hvb45wuum](file://file-VYaHYiihyadA5hVB45wuUm#:~:text=%7B%20%22dispute_id%22%3A%20%22uuid,true).
*/
import React, { useState } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { v4 as uuidv4 } from 'uuid';

export default function DisputeFlow() {
  const supabase = useSupabaseClient();
  const { data: session } = useSession();
  const user = session?.user;
  const userId = user?.id;

  // State for the dispute process
  const [disputeId, setDisputeId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>(''); // current status stage
  const [proofType, setProofType] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofs, setProofs] = useState<any[]>([]);
  const [templateText, setTemplateText] = useState('');
  const [templateMeta, setTemplateMeta] = useState<any>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [pdfMeta, setPdfMeta] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // 1. Create a new dispute (initiated)
  const createDispute = async () => {
    if (!userId) { setError('User not logged in'); return; }
    const newId = uuidv4();
    setLoading(true);
    // Insert dispute record with initial status 'initiated'
    const { data: disputeData, error: disputeError } = await supabase
      .from('disputes')
      .insert([{ dispute_id: newId, user_id: userId, dispute_type: 'subscription_abuse', status: 'initiated' }]);
    if (disputeError) {
      setError('Error creating dispute: ' + disputeError.message);
      setLoading(false);
      return;
    }
    setDisputeId(newId);
    setStatus('initiated');
    // Log agent action: create_dispute [oai_citation:5‡file-ybvhplkvwozwdqmmjamwjr](file://file-YbVhpLkVwoZWdqmMJAMwJR#:~:text=1.%20%D0%A1%D1%82%D0%B2%D0%BE%D1%80%D0%B5%D0%BD%D0%BD%D1%8F%20%D0%B4%D0%B8%D1%81%D0%BF%D1%83%D1%82%D1%83%20,action_taken%3A%20create_dispute)
    await supabase.from('agent_logs').insert([{
      agent_type: 'FlowWatcher',
      action_taken: 'create_dispute',
      case_id: newId,
      success_flag: true,
      fallback_used: false,
    }]);
    setLoading(false);
  };

  // 2. Upload proof file and record it in proof_bundle
  const uploadProof = async () => {
    if (!disputeId || !proofFile || !proofType) {
      setError('Please select proof type and file');
      return;
    }
    setLoading(true);
    // Upload file to Supabase Storage bucket 'proofs'
    const fileExt = proofFile.name.split('.').pop();
    const filePath = `proofs/${disputeId}/${uuidv4()}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('proofs')
      .upload(filePath, proofFile);
    if (uploadError) {
      setError('Upload error: ' + uploadError.message);
      setLoading(false);
      return;
    }
    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage.from('proofs').getPublicUrl(uploadData.path);
    const fileUrl = urlData.publicUrl;

    // Insert proof record into proof_bundle
    const proofRecord = {
      dispute_id: disputeId,
      proof_type: proofType,
      proof_url: fileUrl,
      uploaded_at: new Date().toISOString(),
    };
    await supabase.from('proof_bundle').insert([proofRecord]);
    setProofs([...proofs, proofRecord]);
    // Log agent action: attach_proof [oai_citation:6‡file-ybvhplkvwozwdqmmjamwjr](file://file-YbVhpLkVwoZWdqmMJAMwJR#:~:text=1.%20%D0%A1%D1%82%D0%B2%D0%BE%D1%80%D0%B5%D0%BD%D0%BD%D1%8F%20%D0%B4%D0%B8%D1%81%D0%BF%D1%83%D1%82%D1%83%20,action_taken%3A%20create_dispute)
    await supabase.from('agent_logs').insert([{
      agent_type: 'EvidenceAgent',
      action_taken: 'attach_proof',
      case_id: disputeId,
      success_flag: true,
      fallback_used: false,
    }]);
    // Update status: initiated → proof_collected when first proof added [oai_citation:7‡file-6awepulms4ym1z72yc3evz](file://file-6AWEpULms4YM1Z72YC3eVz#:~:text=%D0%A1%D1%82%D1%80%D1%83%D0%BA%D1%82%D1%83%D1%80%D0%B0%20%D1%81%D1%82%D0%B0%D1%82%D1%83%D1%81%D1%96%D0%B2%3A%201,%D1%83%D1%81%D0%BF%D1%96%D1%88%D0%BD%D0%BE%20%D0%B0%D0%B1%D0%BE%20%D0%B7%20%D0%BA%D0%BE%D0%BC%D0%B5%D0%BD%D1%82%D0%B0%D1%80%D0%B5%D0%BC)
    if (proofs.length + 1 >= 1 && status === 'initiated') {
      await supabase.from('disputes').update({ status: 'proof_collected' }).eq('dispute_id', disputeId);
      setStatus('proof_collected');
    }
    // Check if we have required proofs (e.g., email + bank) to move to proof_ready [oai_citation:8‡file-6awepulms4ym1z72yc3evz](file://file-6AWEpULms4YM1Z72YC3eVz#:~:text=2,%D1%83%D1%81%D0%BF%D1%96%D1%88%D0%BD%D0%BE%20%D0%B0%D0%B1%D0%BE%20%D0%B7%20%D0%BA%D0%BE%D0%BC%D0%B5%D0%BD%D1%82%D0%B0%D1%80%D0%B5%D0%BC)
    const types = [...proofs.map(p => p.proof_type), proofType];
    if (types.includes('email_receipt') && types.includes('bank_statement')) {
      await supabase.from('disputes').update({ status: 'proof_ready' }).eq('dispute_id', disputeId);
      setStatus('proof_ready');
    }
    setLoading(false);
    setProofType('');
    setProofFile(null);
  };

  // 3. Generate GPT template after proofs ready
  const generateTemplate = async () => {
    if (!disputeId) return;
    setLoading(true);
    // Invoke GPT template generation (via Supabase Edge Function)
    const { data: tmpl, error: tmplError } = await supabase.functions.invoke('generate_template', {
      body: { dispute_id: disputeId },
    });
    if (tmplError) {
      setError('Template generation error: ' + tmplError.message);
      setLoading(false);
      return;
    }
    // Assume response includes template_text, language, template_used, escalation_ready
    const { template_text, language, template_used, escalation_ready } = tmpl;
    setTemplateText(template_text);
    setTemplateMeta({ language, template_used, escalation_ready });
    // Store generated template in generated_templates table
    await supabase.from('generated_templates').insert([{
      dispute_id: disputeId,
      template_text: template_text,
      language: language,
      template_used: template_used,
      escalation_ready: escalation_ready,
      created_at: new Date().toISOString(),
    }]);
    // Log agent action: generate_template [oai_citation:9‡file-ybvhplkvwozwdqmmjamwjr](file://file-YbVhpLkVwoZWdqmMJAMwJR#:~:text=4.%20%D0%93%D0%B5%D0%BD%D0%B5%D1%80%D0%B0%D1%86%D1%96%D1%8F%20GPT%20%D1%88%D0%B0%D0%B1%D0%BB%D0%BE%D0%BD%D1%83%20,action_taken%3A%20generate_template)
    await supabase.from('agent_logs').insert([{
      agent_type: 'TemplateAgent',
      action_taken: 'generate_template',
      case_id: disputeId,
      success_flag: true,
      fallback_used: false,
    }]);
    // Update status to template_ready [oai_citation:10‡file-6awepulms4ym1z72yc3evz](file://file-6AWEpULms4YM1Z72YC3eVz#:~:text=4.%20template_ready%20%E2%86%92%20GPT,%D1%83%D1%81%D0%BF%D1%96%D1%88%D0%BD%D0%BE%20%D0%B0%D0%B1%D0%BE%20%D0%B7%20%D0%BA%D0%BE%D0%BC%D0%B5%D0%BD%D1%82%D0%B0%D1%80%D0%B5%D0%BC)
    await supabase.from('disputes').update({ status: 'template_ready' }).eq('dispute_id', disputeId);
    setStatus('template_ready');
    setLoading(false);
  };

  // 4. Generate PDF using the template
  const generatePDF = async () => {
    if (!disputeId || !templateText) return;
    setLoading(true);
    // Invoke PDF generation function
    const { data: pdfData, error: pdfError } = await supabase.functions.invoke('generate_pdf', {
      body: { dispute_id: disputeId, template: templateText },
    });
    if (pdfError) {
      setError('PDF generation error: ' + pdfError.message);
      setLoading(false);
      return;
    }
    // Assume response includes file_url, language, template_used, watermark_applied, generated_at
    const { file_url, language, template_used, watermark_applied, generated_at } = pdfData;
    setPdfUrl(file_url);
    setPdfMeta({ language, template_used, watermark_applied, generated_at });
    // Store PDF metadata in pdf_generated_files table
    await supabase.from('pdf_generated_files').insert([{
      dispute_id: disputeId,
      file_url: file_url,
      generated_at: generated_at,
      template_used: template_used,
      language: language,
      watermark_applied: watermark_applied,
    }]);
    // Log agent action: generate_pdf [oai_citation:11‡file-ybvhplkvwozwdqmmjamwjr](file://file-YbVhpLkVwoZWdqmMJAMwJR#:~:text=5.%20%D0%93%D0%B5%D0%BD%D0%B5%D1%80%D0%B0%D1%86%D1%96%D1%8F%20PDF%20,action_taken%3A%20generate_pdf)
    await supabase.from('agent_logs').insert([{
      agent_type: 'PDFEngine',
      action_taken: 'generate_pdf',
      case_id: disputeId,
      success_flag: true,
      fallback_used: false,
    }]);
    // Update status to pdf_ready [oai_citation:12‡file-6awepulms4ym1z72yc3evz](file://file-6AWEpULms4YM1Z72YC3eVz#:~:text=4.%20template_ready%20%E2%86%92%20GPT,%D1%83%D1%81%D0%BF%D1%96%D1%88%D0%BD%D0%BE%20%D0%B0%D0%B1%D0%BE%20%D0%B7%20%D0%BA%D0%BE%D0%BC%D0%B5%D0%BD%D1%82%D0%B0%D1%80%D0%B5%D0%BC)
    await supabase.from('disputes').update({ status: 'pdf_ready' }).eq('dispute_id', disputeId);
    setStatus('pdf_ready');
    setLoading(false);
  };

  // 5. Close the dispute
  const closeCase = async () => {
    if (!disputeId) return;
    setLoading(true);
    await supabase.from('disputes').update({ status: 'closed' }).eq('dispute_id', disputeId);
    setStatus('closed');
    // Log agent action: close_case [oai_citation:13‡file-ybvhplkvwozwdqmmjamwjr](file://file-YbVhpLkVwoZWdqmMJAMwJR#:~:text=6.%20%D0%97%D0%B0%D0%B2%D0%B5%D1%80%D1%88%D0%B5%D0%BD%D0%BD%D1%8F%20%D0%B4%D0%B8%D1%81%D0%BF%D1%83%D1%82%D1%83%20,action_taken%3A%20close_case)
    await supabase.from('agent_logs').insert([{
      agent_type: 'FlowWatcher',
      action_taken: 'close_case',
      case_id: disputeId,
      success_flag: true,
      fallback_used: false,
    }]);
    setLoading(false);
  };

  // UI rendering
  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      {/* Progress Indicator */}
      <div className="flex justify-between">
        {['initiated', 'proof_collected', 'proof_ready', 'template_ready', 'pdf_ready', 'closed'].map((step) => (
          <div key={step} className={`flex-1 text-center p-2 rounded-t ${status === step ? 'bg-blue-200' : 'bg-gray-200'}`}>
            {step.replace('_', ' ')}
          </div>
        ))}
      </div>

      {/* Step: Create Dispute */}
      {!disputeId && (
        <div className="p-4 border rounded">
          <h2 className="font-bold mb-2">Create New Dispute</h2>
          <button onClick={createDispute} disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            {loading ? 'Creating...' : 'Start Dispute'}
          </button>
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>
      )}

      {/* Steps after dispute is created */}
      {disputeId && status !== 'closed' && (
        <>
          {/* Proof Upload Section */}
          <div className="p-4 border rounded">
            <h2 className="font-bold mb-2">Upload Proofs (Receipts, Statements)</h2>
            <div className="mb-2">
              <select value={proofType} onChange={(e) => setProofType(e.target.value)}
                className="border px-2 py-1 mr-2">
                <option value="">Select proof type</option>
                <option value="email_receipt">Email Receipt</option>
                <option value="bank_statement">Bank Statement</option>
                <option value="other">Other</option>
              </select>
              <input type="file" onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                className="border p-1" />
            </div>
            <button onClick={uploadProof} disabled={loading || !proofFile || !proofType}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              {loading ? 'Uploading...' : 'Add Proof'}
            </button>
            {error && <p className="text-red-600 mt-2">{error}</p>}

            {/* List uploaded proofs */}
            {proofs.length > 0 && (
              <ul className="mt-4 list-disc list-inside">
                {proofs.map((p, idx) => (
                  <li key={idx}>{p.proof_type}: <a href={p.proof_url} target="_blank">{p.proof_url}</a></li>
                ))}
              </ul>
            )}
          </div>

          {/* Generate Template Section */}
          {status === 'proof_ready' && (
            <div className="p-4 border rounded">
              <h2 className="font-bold mb-2">Generate Claim Template</h2>
              <button onClick={generateTemplate} disabled={loading}
                className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600">
                {loading ? 'Generating...' : 'Generate Template (GPT)'}
              </button>
            </div>
          )}

          {/* Template Preview Section */}
          {templateText && (
            <div className="p-4 border rounded">
              <h2 className="font-bold mb-2">Review Generated Template</h2>
              <textarea className="w-full h-32 border p-2" value={templateText} readOnly />
            </div>
          )}

          {/* Generate PDF Section */}
          {status === 'template_ready' && (
            <div className="p-4 border rounded">
              <h2 className="font-bold mb-2">Generate PDF</h2>
              <button onClick={generatePDF} disabled={loading}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
                {loading ? 'Generating PDF...' : 'Generate PDF'}
              </button>
            </div>
          )}

          {/* PDF Ready Section */}
          {status === 'pdf_ready' && pdfUrl && (
            <div className="p-4 border rounded">
              <h2 className="font-bold mb-2">PDF Generated</h2>
              <a href={pdfUrl} target="_blank" className="text-blue-600 underline">Download PDF</a>
            </div>
          )}

          {/* Close Case */}
          {status === 'pdf_ready' && (
            <div className="p-4 border rounded">
              <button onClick={closeCase} disabled={loading}
                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900">
                {loading ? 'Closing...' : 'Close Case'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Final message when closed */}
      {status === 'closed' && (
        <div className="p-4 border rounded bg-green-100">
          <h2 className="font-bold">Case Closed</h2>
          <p>The dispute has been closed successfully.</p>
        </div>
      )}
    </div>
  );
}
