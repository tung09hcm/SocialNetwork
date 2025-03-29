import Posts from "../../components/common/Posts";
import { useParams } from "react-router-dom";
const BookMarkPage = () => {
	const { username } = useParams();
	return (
		<>
			<div className='flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen'>
				{/* POSTS */}
				<Posts feedType="saved" username={username}/>
			</div>
		</>
	);
};
export default BookMarkPage;
