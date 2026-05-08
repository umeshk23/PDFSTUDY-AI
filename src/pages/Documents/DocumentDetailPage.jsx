import { lazy, Suspense, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import documentService from '../../services/documentService.js'
import Spinner from '../../Components/common/Spinner.jsx'
import toast from 'react-hot-toast'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import PageHeader from '../../Components/common/PageHeader.jsx'
import Tabs from '../../Components/common/Tabs.jsx'

const ChatInterface = lazy(() => import('../../Components/chat/ChatInterface.jsx'))
const AiAction = lazy(() => import('../../Components/ai/AiAction.jsx'))
const FlashcardManager = lazy(() => import('../../Components/flashcard/FlashcardManager.jsx'))
const QuizManager = lazy(() => import('../../Components/quizzes/QuizManager.jsx'))


const DocumentDetailPage = () => {

  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [pdfUrl, setPdfUrl] = useState(null);


  useEffect(() => {
    const fetchDocumentDetails = async () => {
      setLoading(true);
      try {
        const data = await documentService.getDocumentById(id);
        setDocument(data);

      } catch (error) {
        toast.error(error.message || "Failed to fetch document details");
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentDetails();
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    let objectUrl = null;

    const fetchDocumentFile = async () => {
      if (!document?.data?._id) {
        setPdfUrl(null);
        return;
      }

      try {
        const pdfBlob = await documentService.getDocumentFile(document.data._id);
        objectUrl = URL.createObjectURL(pdfBlob);
        if (isMounted) {
          setPdfUrl(objectUrl);
        }
      } catch (error) {
        console.error('Error fetching document file:', error);
        toast.error(error.message || 'Failed to load the PDF preview');
      }
    };

    fetchDocumentFile();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [document?.data?._id]);

  const renderContent = () => {
    if (!pdfUrl) {
      return (
        <div className="p-6 bg-white border border-slate-200 rounded-lg text-slate-600">
          <p>No document PDF available.</p>
        </div>
      );
    }

    return (
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm h-full min-h-0 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-4 border-b border-slate-200 bg-slate-50/80 flex-shrink-0">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <ExternalLink className="h-4 w-4" />
            Open PDF in new tab
          </a>
        </div>
        <div className="flex-1 min-h-0 flex flex-col p-4 bg-slate-50">
          <div className="flex-1 min-h-0 rounded-lg border border-slate-200 overflow-hidden shadow-inner bg-white">
            <iframe
              src={pdfUrl}
              title="Document PDF"
              className="w-full h-full border-0"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderChat = () => {
    return (
      <div className="bg-white border border-gray-300 rounded-lg h-full min-h-0 overflow-hidden p-4 flex">
        <Suspense fallback={<Spinner />}>
          <ChatInterface />
        </Suspense>
      </div>
    );
  };

  const renderAIAction = () => {
    return (
      <Suspense fallback={<Spinner />}>
        <AiAction />
      </Suspense>
    );
  };

  const renderFlashcardTab = () => {
    return (
      <Suspense fallback={<Spinner />}>
        <FlashcardManager documentId={id} />
      </Suspense>
    );
  };

  const renderQuizTab = () => {
    return (
      <Suspense fallback={<Spinner />}>
        <QuizManager documentId={id} />
      </Suspense>
    );
  };

  const tabs = [
    { label: 'Content', key: 'content', render: renderContent },
    { label: 'Chat', key: 'chat', render: renderChat },
    { label: 'AI Actions', key: 'ai-actions', render: renderAIAction },
    { label: 'Flashcards', key: 'flashcards', render: renderFlashcardTab },
    { label: 'Quiz', key: 'quiz', render: renderQuizTab },
  ];

  if (loading) {
    return <Spinner />;
  }

  if (!document) {
    return <p className="text-center text-slate-600">Document not found</p>;
  }

  const activeTabData = tabs.find(tab => tab.key === activeTab);

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full overflow-hidden gap-4">
      <Link to='/documents' className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-500 font-medium mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Documents
      </Link>
      <PageHeader 
        title={document.data.title || "Document Details"} 
        description={document.data.description || "View document details and interact with the content."} 
      />
      <div className="flex-shrink-0">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
      <div className="mt-2 flex-1 min-h-0 overflow-hidden">
        {activeTabData && activeTabData.render()}
      </div>
    </div>
  );
}

export default DocumentDetailPage
