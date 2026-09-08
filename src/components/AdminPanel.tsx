import React, { useState, useEffect } from 'react';
import { getAdminBuyerRegistrationRequests, reviewAdminBuyerRegistrationRequest } from '../services/api';
import { BuyerRegistrationRequest, BuyerRegistrationRequestsResponse } from '../types';
import { AuthUser } from '../services/auth';

interface AdminPanelProps {
  user: AuthUser;
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ user, onBack }) => {
  const [data, setData] = useState<BuyerRegistrationRequestsResponse | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceUnavailable, setServiceUnavailable] = useState<boolean>(false);
  
  const [selectedRequest, setSelectedRequest] = useState<BuyerRegistrationRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const [confirmAction, setConfirmAction] = useState<'APPROVED' | 'REJECTED' | 'CONTACTED' | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      setServiceUnavailable(false);
      
      const token = localStorage.getItem('smartmandi_auth_token');
      if (!token) throw new Error('Not authenticated');
      
      const response = await getAdminBuyerRegistrationRequests(token, statusFilter === 'ALL' ? undefined : statusFilter, page);
      setData(response);
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('failed to fetch')) {
        setServiceUnavailable(true);
      } else {
        setError('Unable to load buyer registration requests.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, page]);

  const openReviewModal = (req: BuyerRegistrationRequest) => {
    setSelectedRequest(req);
    setReviewNotes(req.review_notes || '');
    setConfirmAction(null);
  };

  const executeAction = async () => {
    if (!selectedRequest || !confirmAction) return;
    
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('smartmandi_auth_token');
      if (!token) throw new Error('Not authenticated');

      await reviewAdminBuyerRegistrationRequest(token, selectedRequest.id, confirmAction, reviewNotes);
      
      setSelectedRequest(null);
      setConfirmAction(null);
      setReviewNotes('');
      await fetchRequests();
    } catch (err: any) {
      alert(err.message || `Failed to process request`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'APPROVED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      case 'CONTACTED': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!user.roles.includes('ADMIN')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Unauthorized</h2>
        <p className="text-gray-500">You do not have permission to access this page.</p>
        <button onClick={onBack} className="mt-6 text-emerald-600 font-medium hover:underline">Return to Home</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={onBack}
            className="flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700 mb-2 transition-colors"
          >
            ← Back to Home
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Buyer Registration Review</h1>
          <p className="text-gray-500 mt-1">Review and manage buyer registration requests.</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
          {['ALL', 'PENDING', 'CONTACTED', 'APPROVED', 'REJECTED'].map(status => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === status 
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100' 
                  : 'text-gray-600 hover:bg-gray-50 border border-transparent'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {serviceUnavailable ? (
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 text-center">
          <span className="text-3xl block mb-2">🔌</span>
          <p className="font-bold">Buyer registration review service is currently unavailable.</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 border border-red-100 flex items-start">
          <span className="mr-2">⚠️</span>
          {error}
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Loading buyer registration requests...</p>
        </div>
      ) : data?.items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No buyer registration requests found.</h3>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {data && (
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-700 text-sm">
                Total {statusFilter !== 'ALL' ? statusFilter : ''} Requests: {data.total}
              </h3>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Business / Applicant</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.items.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{req.business_name}</div>
                      <div className="text-sm text-gray-500">{req.full_name}</div>
                      <div className="text-xs font-medium text-emerald-600 mt-1">{req.buyer_type}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{req.mobile_number}</div>
                      <div className="text-xs text-gray-500">{req.email || 'Not available'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{req.district}, {req.state}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openReviewModal(req)}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing page {data?.page} of {Math.ceil((data?.total || 0) / (data?.page_size || 50))}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!data?.has_next}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedRequest && !confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md">
              <h3 className="text-xl font-bold text-gray-900">Request Details</h3>
              <button onClick={() => setSelectedRequest(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Applicant Details</h4>
                  <p className="text-gray-900 font-medium">{selectedRequest.full_name}</p>
                  <p className="text-gray-600 text-sm mt-1">{selectedRequest.mobile_number}</p>
                  <p className="text-gray-600 text-sm">{selectedRequest.email || 'No email'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Business Details</h4>
                  <p className="text-gray-900 font-medium">{selectedRequest.business_name}</p>
                  <p className="text-gray-600 text-sm mt-1">{selectedRequest.buyer_type}</p>
                  <p className="text-gray-600 text-sm">{selectedRequest.business_address}</p>
                  <p className="text-gray-600 text-sm">{selectedRequest.district}, {selectedRequest.state} ({selectedRequest.market_area})</p>
                </div>
                <div className="col-span-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Sourcing Information</h4>
                  <p className="text-sm text-gray-800"><strong>Crops:</strong> {selectedRequest.preferred_crops.join(', ')}</p>
                  <p className="text-sm text-gray-800 mt-1"><strong>Volume:</strong> {selectedRequest.min_quantity} - {selectedRequest.max_quantity} {selectedRequest.quantity_unit}</p>
                  <p className="text-sm text-gray-800 mt-1"><strong>Price:</strong> ₹{selectedRequest.min_price} - ₹{selectedRequest.max_price} / kg</p>
                  <p className="text-sm text-gray-800 mt-1"><strong>Frequency:</strong> {selectedRequest.buying_frequency}</p>
                </div>
                <div className="col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Review Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">Status:</span> <span className="font-bold text-gray-900">{selectedRequest.status}</span></div>
                    <div><span className="text-gray-500">Submitted:</span> {new Date(selectedRequest.created_at).toLocaleString()}</div>
                    {selectedRequest.reviewed_at && (
                      <>
                        <div><span className="text-gray-500">Reviewed:</span> {new Date(selectedRequest.reviewed_at).toLocaleString()}</div>
                        {/* Note: the API currently returns reviewed_by as a UUID string, not the full name. */}
                        <div><span className="text-gray-500">Reviewer ID:</span> {selectedRequest.reviewed_by || 'Not available'}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {(selectedRequest.status === 'PENDING' || selectedRequest.status === 'CONTACTED') && (
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Review Notes (Optional)</label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                    rows={3}
                    placeholder="Enter review notes..."
                  ></textarea>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                {selectedRequest.status === 'PENDING' && (
                  <button onClick={() => setConfirmAction('CONTACTED')} className="px-6 py-2.5 rounded-xl font-bold text-blue-700 bg-blue-50 border border-blue-200">
                    Mark Contacted
                  </button>
                )}
                
                {(selectedRequest.status === 'PENDING' || selectedRequest.status === 'CONTACTED') && (
                  <>
                    <button onClick={() => setConfirmAction('REJECTED')} className="px-6 py-2.5 rounded-xl font-bold text-red-700 bg-red-50 border border-red-200">
                      Reject
                    </button>
                    <button onClick={() => setConfirmAction('APPROVED')} className="px-8 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700">
                      Approve
                    </button>
                  </>
                )}
                
                {(selectedRequest.status === 'APPROVED' || selectedRequest.status === 'REJECTED') && (
                  <button onClick={() => setSelectedRequest(null)} className="px-6 py-2.5 rounded-xl font-bold text-gray-700 bg-gray-100">
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Action</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to mark this request as <strong className="text-gray-900">{confirmAction}</strong>?
            </p>
            
            {confirmAction === 'REJECTED' && !reviewNotes.trim() && (
              <div className="text-red-600 text-sm mb-4 text-left p-3 bg-red-50 rounded-lg">
                Warning: You are rejecting this request without providing any review notes.
              </div>
            )}
            
            <div className="flex gap-3 justify-center">
              <button
                disabled={isSubmitting}
                onClick={() => setConfirmAction(null)}
                className="px-6 py-2.5 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={executeAction}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700"
              >
                {isSubmitting ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
