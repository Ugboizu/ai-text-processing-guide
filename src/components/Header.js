import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';
import '../css/Header.css';

const Header = () => {
  return (
	<header className="header">
		<div className=''>
			<h1 className='header_name'>
			<FontAwesomeIcon icon={ faRobot } /> ViolaAI
			</h1>
		</div>

		

	</header>
  )
}

export default Header;



