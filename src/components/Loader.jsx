import { Oval } from 'react-loader-spinner';

const Loader = ({ height = 48, width = 48, color = '#FF5A5F', secondaryColor = '#e0e0e0', ...props }) => (
  <Oval
    height={height}
    width={width}
    color={color}
    secondaryColor={secondaryColor}
    strokeWidth={2}
    strokeWidthSecondary={2}
    ariaLabel="oval-loading"
    visible={true}
    {...props}
  />
);

export default Loader; 