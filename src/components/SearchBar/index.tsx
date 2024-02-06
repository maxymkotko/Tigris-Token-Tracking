import { Search } from '@mui/icons-material';
import { Box, InputBase } from '@mui/material';
import { styled } from '@mui/system';

interface SearchProps {
  onChange: any;
}
export const SearchBar = ({ onChange }: SearchProps) => {
  return (
    <SearchBarContainer>
      <Search sx={{ color: '#777E90' }} />
      <InputBox placeholder="Search" onChange={onChange} />
    </SearchBarContainer>
  );
};

const SearchBarContainer = styled(Box)({
  padding: '2px 4px',
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  gap: 10,
  backgroundColor: '#222630',
  height: '36px',
  borderRadius: '4px',
  fontSize: '12px'
});

const InputBox = styled(InputBase)({
  marginLeft: 1,
  flex: 1,
  fontSize: '12px',
  fontFamily: 'DM Sans'
});
