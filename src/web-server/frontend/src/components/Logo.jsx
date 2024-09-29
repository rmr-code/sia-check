import logo from '../assets/sia.svg';

const Logo = ({width=128, height=128}) => {
    return (
        <img src={logo} alt="Logo" width={width} height={height} />
    )
}

export default Logo;