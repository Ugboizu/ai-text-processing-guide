import React from 'react';
// import backgroundImage from '../assets/images/background.jpg';
import { Link } from 'react-router-dom';
import '../css/Home.css';

export default function Home() {
  return (
	<>
		<div className="bgImage">
            {/* <img src={backgroundImage} alt="Background" className="w-full opacity-75" /> */}
        </div>

		<div className='absolute top-1/2 left-1/2 text-center translate-x-[-50%] translate-y-[-50%] text-white'>
			<h1 className='font-bold text-5xl py-10'>ViolaAI</h1>

			<div className="max-w-lg mx-auto">
				<Link to="/chat" className="block">
					<button
					className="w-full bg-blue-700 text-white text-xl font-semibold py-4 px-6 rounded-lg shadow-lg 
						hover:bg-blue-800 transition duration-300 ease-in-out transform hover:scale-105">
					Get Started
					</button>
				</Link>
				<p className="mt-4 text-lg text-gray-200">
					Instantly detect languages, translate, and summarize paragraphs with Voila AI. 
					Perfect for texts over 150 words—try it now!
				</p>
			</div>
		</div>
	</>

  )
}
