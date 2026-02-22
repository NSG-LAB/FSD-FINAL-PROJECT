import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';

const OnboardingWizard = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to PropertyPro!',
      description: 'Your comprehensive platform for property value enhancement and investment planning.',
      content: (
        <div className="text-center space-y-4">
          <div className="text-6xl">🏠</div>
          <p className="text-lg text-gray-600">
            Let's take a quick tour to help you get started with maximizing your property's value.
          </p>
        </div>
      ),
      action: 'Get Started'
    },
    {
      id: 'dashboard',
      title: 'Your Command Center',
      description: 'Access all your property management tools from one central location.',
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Dashboard Features:</h4>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• Quick property overview and statistics</li>
              <li>• Recent valuations and recommendations</li>
              <li>• Fast access to key actions</li>
              <li>• Performance tracking and insights</li>
            </ul>
          </div>
        </div>
      ),
      action: 'View Dashboard',
      navigateTo: '/user/dashboard'
    },
    {
      id: 'valuation',
      title: 'Property Valuation',
      description: 'Get accurate property valuations with our advanced estimation tools.',
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">Valuation Tools:</h4>
            <ul className="text-green-800 space-y-1 text-sm">
              <li>• Real-time market data analysis</li>
              <li>• Comparative market analysis</li>
              <li>• ROI projections and charts</li>
              <li>• Investment opportunity identification</li>
            </ul>
          </div>
        </div>
      ),
      action: 'Try Valuation Tool',
      navigateTo: '/valuation'
    },
    {
      id: 'recommendations',
      title: 'Smart Recommendations',
      description: 'Receive personalized suggestions to enhance your property value.',
      content: (
        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">AI-Powered Insights:</h4>
            <ul className="text-purple-800 space-y-1 text-sm">
              <li>• Property improvement suggestions</li>
              <li>• Market trend analysis</li>
              <li>• Cost-benefit analysis</li>
              <li>• Timeline planning</li>
            </ul>
          </div>
        </div>
      ),
      action: 'Explore Recommendations',
      navigateTo: '/recommendations'
    },
    {
      id: 'roi-planner',
      title: 'ROI Planning',
      description: 'Plan and track your property investment returns with detailed analysis.',
      content: (
        <div className="space-y-4">
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-semibold text-orange-900 mb-2">Planning Features:</h4>
            <ul className="text-orange-800 space-y-1 text-sm">
              <li>• Investment scenario modeling</li>
              <li>• Break-even analysis</li>
              <li>• Cash flow projections</li>
              <li>• Risk assessment tools</li>
            </ul>
          </div>
        </div>
      ),
      action: 'Plan Investments',
      navigateTo: '/roi-planner'
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'Start exploring your property enhancement journey.',
      content: (
        <div className="text-center space-y-4">
          <div className="text-6xl">🎉</div>
          <p className="text-lg text-gray-600">
            You've completed the tour! Feel free to explore all the features at your own pace.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Need help?</strong> Check out our documentation or contact support anytime.
            </p>
          </div>
        </div>
      ),
      action: 'Start Exploring'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setCompletedSteps([]);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => [...prev, steps[currentStep].id]);
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleAction = () => {
    const step = steps[currentStep];
    if (step.navigateTo) {
      navigate(step.navigateTo);
      onClose();
    } else if (step.id === 'complete') {
      onClose();
    } else {
      handleNext();
    }
  };

  const handleSkip = () => {
    // Mark onboarding as completed for this user
    localStorage.setItem(`onboarding_completed_${user?.id}`, 'true');
    onClose();
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
          <button
            onClick={handleSkip}
            className="ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Skip tutorial"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentStepData.title}
            </h2>
            <p className="text-gray-600">
              {currentStepData.description}
            </p>
          </div>

          <div className="mb-8">
            {currentStepData.content}
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center space-x-2 mb-8">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index < currentStep
                    ? 'bg-green-500'
                    : index === currentStep
                    ? 'bg-blue-600'
                    : 'bg-gray-300'
                }`}
              >
                {index < currentStep && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>

          <button
            onClick={handleAction}
            className="btn-primary px-6 py-2"
          >
            {currentStepData.action}
          </button>

          <button
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;