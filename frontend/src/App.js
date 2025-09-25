/** Main App component */
import './index.css';
import { Toaster } from 'react-hot-toast';

// Components
import Header from './components/Header';
import SupplierForm from './components/SupplierForm';
import SupplierDisplay from './components/SupplierDisplay';
import Resources from './components/Resources';

// Hooks
import { useSupplier } from './hooks/useSupplier';

// Configuration
import environment from './config/environment';

function App() {
  const {
    supplier,
    resources,
    isLoading,
    isInitialLoading,
    isEditing,
    setIsEditing,
    loadExistingSupplier,
    saveSupplier,
    addResource,
    refreshResources,
    upsertResource
  } = useSupplier();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-80 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 border-r border-gray-200">
        <Header 
          appName={environment.APP_NAME}
          version={environment.VERSION}
          supplier={supplier}
          resources={resources}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-screen overflow-auto">
        <div className="container mx-auto px-8 py-8 max-w-4xl">
          <main className="space-y-8">
            {isInitialLoading ? (
              <div className="glass-card p-8 md:p-10 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-orange-500 rounded-full mx-auto mb-4" />
                <p className="text-gray-600">Loading your workspace...</p>
              </div>
            ) : (
              <>
                {isEditing || !supplier ? (
                  <SupplierForm 
                    supplier={supplier}
                    onSave={saveSupplier}
                    isLoading={isLoading}
                  />
                ) : (
                  <SupplierDisplay 
                    supplier={supplier}
                    onEdit={() => setIsEditing(true)}
                  />
                )}

                {supplier && !isEditing && (
                  <Resources
                    resources={resources}
                    onAddResource={addResource}
                    isLoading={isLoading}
                    onResourcesRefresh={refreshResources}
                    onResourceUpdated={upsertResource}
                  />
                )}

              </>
            )}
          </main>
        </div>
      </div>

      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'glass-toast',
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '16px',
            color: '#1e293b',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#ec6636',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default App;
