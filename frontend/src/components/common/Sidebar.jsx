import XSvg from "../svgs/X";
import { useState, useRef } from "react";
import { MdHomeFilled   } from "react-icons/md";
import { Search } from "lucide-react";
import { IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { Link,useNavigate  } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaBookmark } from "react-icons/fa";
import toast from "react-hot-toast";

const Sidebar = () => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const [search, setSearch] = useState("");
	const { mutate: logout } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch("/api/auth/logout", {
					method: "POST",
				});
				const data = await res.json();

				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
			} catch (error) {
				throw new Error(error);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
		},
		onError: () => {
			toast.error("Logout failed");
		},
	});
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const modalRef = useRef(null);
	const handleOutsideClick = (e) => {
		if (modalRef.current && !modalRef.current.contains(e.target)) {
			setIsSearchOpen(false);
		}
	};
	const handleSearch = () =>{		
		console.log("handle Search Content: ", search);
		navigate(`/search/${search}`);
	}
	return (
		<div className='md:flex-[2_2_0] w-18 max-w-52'>
			<div className='sticky top-0 left-0 h-screen flex flex-col border-r border-gray-700 w-20 md:w-full'>
				<Link to='/' className='flex justify-center md:justify-start'>
					<XSvg className='px-2 w-12 h-12 rounded-full fill-white hover:bg-stone-900' />
				</Link>
				<ul className='flex flex-col gap-3 mt-4'>
					<li className='flex justify-center md:justify-start'>
						<Link
							to='/'
							className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
						>
							<MdHomeFilled className='w-8 h-8' />
							<span className='text-lg hidden md:block'>Home</span>
						</Link>
					</li>
					<li className='flex justify-center md:justify-start'>
						<Link
							to='/notifications'
							className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
						>
							<IoNotifications className='w-6 h-6' />
							<span className='text-lg hidden md:block'>Notifications</span>
						</Link>
					</li>

					<li className='flex justify-center md:justify-start'>
						<Link
							to={`/profile/${authUser?.username}`}
							className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
						>
							<FaUser className='w-6 h-6' />
							<span className='text-lg hidden md:block'>Profile</span>
						</Link>
					</li>

					<li className='flex justify-center md:justify-start'>
						<Link
							to={`/profile/${authUser?.username}`}
							className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
						>
							<FaBookmark className='w-6 h-6' />
							<span className='text-lg hidden md:block'>Save</span>
						</Link>
					</li>

					<li className='flex justify-center md:justify-start'>
						<div className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer">
							{/* Nút mở dialog */}
							<button onClick={() => setIsSearchOpen(true)} className="flex items-center gap-2">
								<Search className="w-6 h-6" />
								<span className="text-lg hidden md:block">Search</span>
							</button>

							{/* Dialog */}
							{isSearchOpen && (
								<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
									onClick={handleOutsideClick}
								>
									<div className="modal-box rounded border border-gray-600" ref={modalRef}>
										<h3 className="font-bold text-lg mb-4">SEARCH</h3>
										<form className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2"
											onSubmit={handleSearch}
										>
											<textarea
											className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none  border-gray-800"
											placeholder="Find on Trade ..."
											value={search}
											onChange={(e) => setSearch(e.target.value)}
											/>
											<button
											className="btn btn-primary rounded-full btn-sm text-white px-4"
											>
												Submit
											</button>
										</form>
										
									</div>
								</div>
							)}

						</div>
					</li>
				</ul>
				{authUser && (
					<Link
						to={`/profile/${authUser.username}`}
						className='mt-auto mb-10 flex gap-2 items-start transition-all duration-300 hover:bg-[#181818] py-2 px-4 rounded-full'
					>
						<div className='avatar hidden md:inline-flex'>
							<div className='w-8 rounded-full'>
								<img src={authUser?.profileImg || "/avatar-placeholder.png"} />
							</div>
						</div>
						<div className='flex justify-between flex-1'>
							<div className='hidden md:block'>
								<p className='text-white font-bold text-sm w-20 truncate'>{authUser?.fullName}</p>
								<p className='text-slate-500 text-sm'>@{authUser?.username}</p>
							</div>
							<BiLogOut
								className='w-5 h-5 cursor-pointer'
								onClick={(e) => {
									e.preventDefault();
									logout();
								}}
							/>
						</div>
					</Link>
				)}
			</div>
		</div>
	);
};
export default Sidebar;
