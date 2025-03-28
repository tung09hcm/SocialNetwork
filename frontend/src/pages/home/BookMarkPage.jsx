import Posts from "../../components/common/Posts";
const BookMarkPage = () => {
	return (
		<>
			<div className='flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen'>
				{/* POSTS */}
				<Posts feedType="search" />
			</div>
		</>
	);
};
export default BookMarkPage;
