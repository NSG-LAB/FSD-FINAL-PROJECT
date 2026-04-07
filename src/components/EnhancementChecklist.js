import React, { useEffect, useState, useRef } from 'react';
import { enhancementChecklistAPI } from '../services/api';
import { toast } from 'react-toastify';


const BEFORE_ITEMS = [
  'Document current condition (photos)',
  'Get property appraised',
  'Note existing issues',
  'Plan budget',
  'Research contractors',
  'Create timeline'
];
const AFTER_ITEMS = [
  'Get work certified',
  'Take after photos',
  'Collect warranties',
  'Get updated appraisal',
  'Document improvements',
  'Update property records'
];

function EnhancementChecklist({ propertyId, userId }) {
  const [beforeItems, setBeforeItems] = useState([]);
  const [afterItems, setAfterItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const fileInputRefs = useRef({});

  useEffect(() => {
    if (!propertyId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      enhancementChecklistAPI.getByPropertyBefore(propertyId),
      enhancementChecklistAPI.getByPropertyAfter(propertyId)
    ])
      .then(([beforeRes, afterRes]) => {
        setBeforeItems(Array.isArray(beforeRes.data) ? beforeRes.data : []);
        setAfterItems(Array.isArray(afterRes.data) ? afterRes.data : []);
      })
      .catch(err => {
        console.error('Checklist fetch error:', err);
        setError(err.message || 'Failed to load checklist');
      })
      .finally(() => setLoading(false));
  }, [propertyId]);

  const handleCheck = async (itemId, completed, type) => {
    try {
      await enhancementChecklistAPI.updateItem(itemId, { completed });
      if (type === 'before') {
        setBeforeItems(items => items.map(i => (i.id === itemId || i._id === itemId) ? { ...i, completed } : i));
      } else {
        setAfterItems(items => items.map(i => (i.id === itemId || i._id === itemId) ? { ...i, completed } : i));
      }
      toast.success(completed ? 'Marked as complete!' : 'Marked as incomplete.');
    } catch (err) {
      toast.error('Failed to update checklist item.');
    }
  };

  const handlePhotoUpload = async (itemId, files, type) => {
    if (!files || files.length === 0) return;
    const formData = new FormData();
    for (let file of files) formData.append('photos', file);
    setUploadingId(itemId);
    try {
      const res = await enhancementChecklistAPI.uploadFiles(itemId, formData);
      if (type === 'before') {
        setBeforeItems(items => items.map(i => (i.id === itemId || i._id === itemId) ? { ...i, attachmentUrls: res.data.urls } : i));
      } else {
        setAfterItems(items => items.map(i => (i.id === itemId || i._id === itemId) ? { ...i, attachmentUrls: res.data.urls } : i));
      }
      toast.success('File(s) uploaded!');
    } catch (err) {
      toast.error('Failed to upload file(s).');
    } finally {
      setUploadingId(null);
    }
  };

  const handleDeleteFile = async (itemId, url, type) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      const res = await enhancementChecklistAPI.deleteFile(itemId, url);
      if (type === 'before') {
        setBeforeItems(items => items.map(i => (i.id === itemId || i._id === itemId) ? { ...i, attachmentUrls: res.data.urls } : i));
      } else {
        setAfterItems(items => items.map(i => (i.id === itemId || i._id === itemId) ? { ...i, attachmentUrls: res.data.urls } : i));
      }
      toast.success('File deleted.');   
    } catch (err) {
      toast.error('Failed to delete file.');
    }
  };

  if (loading) return <div className="p-4 text-center text-gray-500">Loading checklist...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  // Helper: which items need notes/value entry
  const needsNotes = (item) => [
    'appraised', 'issues', 'budget', 'contractor', 'timeline', 'certified', 'warrant', 'improvement', 'record'
  ].some(key => item.toLowerCase().includes(key));

  // Progress indicator helper
  const getProgress = (items) => {
    if (!Array.isArray(items) || !items.length) return 0;
    const completed = items.filter(i => i.completed).length;
    return Math.round((completed / items.length) * 100);
  };

  // Render checklist section
  const renderChecklist = (items, type, label) => {
    if (!Array.isArray(items)) return null;
    const progress = getProgress(items);
    return (
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {label}
          <span style={{ fontSize: 13, color: '#666', fontWeight: 400 }}>
            {progress}% complete
          </span>
          <div style={{ flex: 1, height: 8, background: '#eee', borderRadius: 4, marginLeft: 8, marginRight: 8, maxWidth: 120 }}>
            <div style={{ width: `${progress}%`, height: '100%', background: progress === 100 ? '#22c55e' : '#3b82f6', borderRadius: 4, transition: 'width 0.3s' }} />
          </div>
        </h4>
        <ul>
          {items.map(item => (
            <li key={item.id || item._id} style={{ marginBottom: 16 }}>
              <label>
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={e => handleCheck(item.id || item._id, e.target.checked, type)}
                />
                {item.item}
              </label>
              {/* Timestamps */}
              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                {item.completed && item.updatedAt && (
                  <span>Completed: {new Date(item.updatedAt).toLocaleString()}</span>
                )}
                {!item.completed && item.updatedAt && (
                  <span>Last updated: {new Date(item.updatedAt).toLocaleString()}</span>
                )}
                {item.createdAt && !item.updatedAt && (
                  <span>Created: {new Date(item.createdAt).toLocaleString()}</span>
                )}
              </div>
              {/* Notes/value entry for relevant items */}
              {needsNotes(item.item) && (
                <div style={{ marginTop: 6 }}>
                  <textarea
                    rows={2}
                    placeholder={
                      item.item.toLowerCase().includes('appraised') ? 'Enter appraised value or notes' :
                      item.item.toLowerCase().includes('issues') ? 'Describe issues' :
                      item.item.toLowerCase().includes('budget') ? 'Enter budget details' :
                      item.item.toLowerCase().includes('contractor') ? 'Enter contractor info' :
                      item.item.toLowerCase().includes('timeline') ? 'Enter timeline details' :
                      item.item.toLowerCase().includes('certified') ? 'Enter certification details' :
                      item.item.toLowerCase().includes('warrant') ? 'Enter warranty details' :
                      item.item.toLowerCase().includes('improvement') ? 'Describe improvements' :
                      item.item.toLowerCase().includes('record') ? 'Enter updated record info' :
                      'Add notes'
                    }
                    value={item.notes || ''}
                    style={{ width: '100%', marginBottom: 4 }}
                    onChange={async (e) => {
                      const notes = e.target.value;
                      try {
                        await enhancementChecklistAPI.updateItem(item.id || item._id, { notes });
                        if (type === 'before') {
                          setBeforeItems(items => items.map(i => (i.id === item.id || i._id === item._id) ? { ...i, notes } : i));
                        } else {
                          setAfterItems(items => items.map(i => (i.id === item.id || i._id === item._id) ? { ...i, notes } : i));
                        }
                      } catch (err) {
                        toast.error('Failed to save notes.');
                      }
                    }}
                  />
                </div>
              )}
              {/* Photo upload for photo-related items */}
              {(item.item.toLowerCase().includes('photo') || item.item.toLowerCase().includes('certified') || item.item.toLowerCase().includes('warrant') || item.item.toLowerCase().includes('record')) && (
                <div style={{ marginTop: 6 }}>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    multiple
                    style={{ display: 'none' }}
                    ref={el => fileInputRefs.current[item.id || item._id] = el}
                    onChange={e => {
                      handlePhotoUpload(item.id || item._id, e.target.files, type);
                      e.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    disabled={uploadingId === (item.id || item._id)}
                    onClick={() => fileInputRefs.current[item.id || item._id]?.click()}
                    style={{ marginRight: 8, padding: '4px 8px', fontSize: '12px' }}
                  >
                    {uploadingId === (item.id || item._id) ? 'Uploading...' : 'Upload File(s)'}
                  </button>
                  {/* Show thumbnails/links if any */}
                  {Array.isArray(item.attachmentUrls) && item.attachmentUrls.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                      {item.attachmentUrls.map((url, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          {url.match(/\.(jpg|jpeg|png|gif)$/i)
                            ? <a href={url} target="_blank" rel="noopener noreferrer">
                                <img src={url} alt="Uploaded" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4, border: '1px solid #ccc' }} />
                              </a>
                            : <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: 4, border: '1px solid #ccc', borderRadius: 4, fontSize: '10px' }}>
                                FILE
                              </a>
                          }
                          <button
                            type="button"
                            style={{ marginTop: 2, fontSize: 11, color: '#e11d48', background: 'none', border: 'none', cursor: 'pointer' }}
                            onClick={() => handleDeleteFile(item.id || item._id, url, type)}
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };
  return (
    <div>
      {renderChecklist(beforeItems, 'before', 'Before Enhancement')}
      {renderChecklist(afterItems, 'after', 'After Enhancement')}
    </div>
  );
}

export default EnhancementChecklist;
