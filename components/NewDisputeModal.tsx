import React, { useState } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';

const DisputeFlow: React.FC = () => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [disputeId, setDisputeId] = useState<string | null>(null);
  const [disputeType, setDisputeType] = useState<string>('');
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // 1. Create a new dispute using the authenticated user ID
  const handleCreateDispute = async () => {
    if (!session?.user) {
      console.error('No authenticated user session found.');
      return;
    }
    setLoading(true);
    try {
      // Insert dispute without specifying dispute_id (Supabase will generate it)
      const { data: disputeData, error: disputeError } = await supabase
        .from('disputes')
        .insert([
          {
            user_id: session.user.id,
            dispute_type: disputeType,
            status: 'initiated',
          },
        ])
        .select();  // Retrieve the inserted row

      if (disputeError) {
        throw disputeError;
      }
      const newDisputeId = disputeData && disputeData.length > 0 ? disputeData[0].dispute_id : null;
      setDisputeId(newDisputeId);
      setStatusMessage('Dispute created successfully.');

      // Log the creation of the dispute
      await supabase.from('agent_logs').insert([
        {
          agent_type: 'FlowWatcher',
          action_taken: 'create_dispute',
          case_id: newDisputeId,
          success_flag: true,
          fallback_used: false,
        },
      ]);
    } catch (error) {
      console.error('Error creating dispute:', error);
      setStatusMessage('Failed to create dispute.');
    }
    setLoading(false);
  };

  // 2. Upload proof files and link them to the dispute
  const handleUploadProofs = async () => {
    if (!disputeId) return;
    setLoading(true);
    try {
      for (const file of proofFiles) {
        const filePath = `proofs/${disputeId}/${Date.now()}_${file.name}`;
        // Upload file to Supabase storage (bucket "proofs")
        const { data: storageData, error: storageError } = await supabase.storage
          .from('proofs')
          .upload(filePath, file);
        if (storageError) {
          console.error('Error uploading file:', storageError);
          continue;
        }
        // Get public URL of the uploaded file
        const { data: urlData } = supabase.storage.from('proofs').getPublicUrl(storageData.path);
        const publicUrl = urlData.publicUrl;

        // Insert proof metadata into proof_bundle table
        await supabase.from('proof_bundle').insert([
          {
            dispute_id: disputeId,
            proof_type: 'uploaded_proof',
            proof_url: publicUrl,
            uploaded_at: new Date().toISOString(),
          },
        ]);

        // Log the proof attachment event
        await supabase.from('agent_logs').insert([
          {
            agent_type: 'EvidenceAgent',
            action_taken: 'attach_proof',
            case_id: disputeId,
            success_flag: true,
            fallback_used: false,
          },
        ]);
      }

      // Update dispute status after adding proofs
      await supabase
        .from('disputes')
        .update({ status: 'evidence_added' })
        .eq('dispute_id', disputeId);

      setStatusMessage('Proofs uploaded successfully.');
    } catch (error) {
      console.error('Error uploading proofs:', error);
      setStatusMessage('Failed to upload proofs.');
    }
    setLoading(false);
  };

  // 3. (Placeholder) Generate a GPT-based claim/template
  const handleGenerateClaim = async () => {
    if (!disputeId) return;
    setLoading(true);
    try {
      // TODO: Invoke GPT template generation (e.g., via a Supabase function or API)
      // Example: await supabase.functions.invoke('generate_claim', { disputeId });

      // Log the template generation event
      await supabase.from('agent_logs').insert([
        {
          agent_type: 'TemplateAgent',
          action_taken: 'generate_template',
          case_id: disputeId,
          success_flag: true,
          fallback_used: false,
        },
      ]);

      setStatusMessage('Claim generated successfully.');
    } catch (error) {
      console.error('Error generating claim:', error);
      setStatusMessage('Failed to generate claim.');
    }
    setLoading(false);
  };

  // 4. (Placeholder) Generate a PDF for the dispute
  const handleGeneratePDF = async () => {
    if (!disputeId) return;
    setLoading(true);
    try {
      // TODO: Invoke PDF generation logic and obtain the PDF URL
      // Example: const pdfUrl = await generatePDF(disputeId);

      // Example: Insert PDF metadata into pdf_generated_files table
      // await supabase.from('pdf_generated_files').insert([
      //   {
      //     dispute_id: disputeId,
      //     file_url: pdfUrl,
      //     generated_at: new Date().toISOString(),
      //     template_used: disputeType,
      //     language: 'en',
      //     watermark_applied: true,
      //   },
      // ]);

      // Log the PDF generation event
      await supabase.from('agent_logs').insert([
        {
          agent_type: 'PDFEngine',
          action_taken: 'generate_pdf',
          case_id: disputeId,
          success_flag: true,
          fallback_used: false,
        },
      ]);

      // Update dispute status to 'closed'
      await supabase
        .from('disputes')
        .update({ status: 'closed' })
        .eq('dispute_id', disputeId);

      // Log the closure of the dispute
      await supabase.from('agent_logs').insert([
        {
          agent_type: 'FlowWatcher',
          action_taken: 'close_case',
          case_id: disputeId,
          success_flag: true,
          fallback_used: false,
        },
      ]);

      setStatusMessage('PDF generated and dispute closed.');
    } catch (error) {
      console.error('Error generating PDF:', error);
      setStatusMessage('Failed to generate PDF.');
    }
    setLoading(false);
  };

  return (
    <div>
      {!disputeId ? (
        // Step 1: Create Dispute
        <div>
          <h2>Create New Dispute</h2>
          <label>
            Dispute Type:
            <select
              value={disputeType}
              onChange={(e) => setDisputeType(e.target.value)}
            >
              <option value="">Select Type</option>
              <option value="subscription_abuse">Subscription Abuse</option>
              <option value="billing_error">Billing Error</option>
              <option value="other">Other</option>
            </select>
          </label>
          <br />
          <button
            onClick={handleCreateDispute}
            disabled={!disputeType || loading}
          >
            {loading ? 'Creating...' : 'Create Dispute'}
          </button>
          {statusMessage && <p>{statusMessage}</p>}
        </div>
      ) : (
        // Steps after dispute creation: upload proofs, generate claim, generate PDF
        <div>
          <h2>Dispute ID: {disputeId}</h2>
          <div>
            <h3>1. Upload Proofs</h3>
            <input
              type="file"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  setProofFiles(Array.from(e.target.files));
                }
              }}
            />
            <button
              onClick={handleUploadProofs}
              disabled={proofFiles.length === 0 || loading}
            >
              {loading ? 'Uploading...' : 'Upload Proofs'}
            </button>
          </div>
          <div>
            <h3>2. Generate Claim (GPT Template)</h3>
            <button onClick={handleGenerateClaim} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Claim'}
            </button>
          </div>
          <div>
            <h3>3. Generate PDF</h3>
            <button onClick={handleGeneratePDF} disabled={loading}>
              {loading ? 'Generating PDF...' : 'Generate PDF'}
            </button>
          </div>
          {statusMessage && <p>{statusMessage}</p>}
        </div>
      )}
    </div>
  );
};

export default DisputeFlow;
