import React from "react";

class ErrorBoundary extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }


  static getDerivedStateFromError() {

    return {
      hasError: true,
    };
  }


  componentDidCatch(
    error,
    errorInfo
  ) {

    console.log(
      "Error Boundary:",
      error,
      errorInfo
    );
  }


  handleRefresh = () => {

    window.location.reload();
  };


  render() {

    if (
      this.state.hasError
    ) {

      return (

        <div className="min-h-screen bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white flex items-center justify-center px-6">

          <div className="max-w-lg text-center">

            <h1 className="text-5xl font-bold mb-6">
              Something went wrong
            </h1>

            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">

              An unexpected error occurred.
              Please refresh the page
              and try again.

            </p>

            <button
              onClick={
                this.handleRefresh
              }
              className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 rounded-2xl font-semibold"
            >
              Refresh Page
            </button>

          </div>

        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;