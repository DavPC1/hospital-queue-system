import Reception from './pages/Reception';
import Triage from './pages/Triage';
import Doctor from './pages/Doctor';
import Display from './pages/Display';

function App() {
  return (
    <div className="space-y-8">
      <Reception />
      <Triage />
      <Doctor />
      <Display />
    </div>
  );
}

export default App;
