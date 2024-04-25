import { StrictMode } from 'react';

export const App = () => {
	return (
		<StrictMode>
			<p>This serve is run parallism!</p>
			<img
				src='./img/react.svg'
				className='react-logo'
			/>
			<h1>Hello from React &lt;App&gt;</h1>
			<span>Edit src/App.tsx</span>
			<input
				className='bg-blue-400 rounded-sm shadow-sm px-6 py-2 placeholder:text-gray-500'
				placeholder='Input your name!'
			/>
		</StrictMode>
	);
};
