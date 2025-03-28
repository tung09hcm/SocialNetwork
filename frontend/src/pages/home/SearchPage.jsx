import Posts from "../../components/common/Posts";
import { useParams } from "react-router-dom";
const SearchPage = () => {
	const { search } = useParams();
	console.log("content_search: ", search);
	return (
		<>
			<div className='flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen'>
				{/* POSTS */}
				<Posts feedType="search" content={search} />
			</div>
		</>
	);
};
export default SearchPage;
