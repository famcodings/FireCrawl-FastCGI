/** Header component for the application */
import PropTypes from 'prop-types';

const Header = ({ appName = 'InfoBud PoC', version = '1.0.0' }) => {
  return (
    <header className="text-center mb-12">
      <div className="glass-card p-8 md:p-12 relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10" />
        
        {/* Content */}
        <div className="relative z-10">

          {/* Title */}
          <div className="relative mb-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight relative px-6 py-2">
              
              {/* Main text with shimmer animation */}
              <span className="relative text-shimmer drop-shadow-2xl">
                {appName}
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/90 font-medium mb-4 max-w-2xl mx-auto leading-relaxed">
            Extract comprehensive company insights from any website using AI-powered analysis
          </p>

          {/* Features badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <span className="px-4 py-2 text-sm font-medium text-white/80 bg-white/10 rounded-full backdrop-blur-sm border border-white/20">
              🚀 AI-Powered
            </span>
            <span className="px-4 py-2 text-sm font-medium text-white/80 bg-white/10 rounded-full backdrop-blur-sm border border-white/20">
              ⚡ Real-time
            </span>
            <span className="px-4 py-2 text-sm font-medium text-white/80 bg-white/10 rounded-full backdrop-blur-sm border border-white/20">
              📊 Comprehensive
            </span>
          </div>

          {/* Version */}
          <div className="text-sm text-white/60 font-mono">
            v{version}
          </div>
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  appName: PropTypes.string,
  version: PropTypes.string
};

export default Header;