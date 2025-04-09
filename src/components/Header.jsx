import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';

const Header = () => {
  return (
	<header className="header">
		<div className='flex mt-2 text-viola-dark justify-center'>
			<h1 className='header_name font-piedra font-semibold text-3xl '>
			<FontAwesomeIcon icon={ faRobot } /> ViolaAI
			</h1>
		</div>

		

	</header>
  )
}

export default Header;



