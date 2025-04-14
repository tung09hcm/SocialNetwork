import { CiImageOn, CiFileOff } from "react-icons/ci";
import { useRef, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const CreatePost = () => {
	const [text, setText] = useState("");
	const [img, setImg] = useState(null);
	const [file, setFile] = useState(null);
	const imgRef = useRef(null);
	const fileRef = useRef(null);

	const { data: authUser } = useQuery({ queryKey: ["authUser"] });
	const queryClient = useQueryClient();

	// Mutation cho post có ảnh
	const {
		mutate: createPost,
		isPending,
		isError,
		error,
	} = useMutation({
		mutationFn: async ({ text, img }) => {
			const res = await fetch("/api/posts/create", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ text, img }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Something went wrong");
			return data;
		},
		onSuccess: () => {
			setText("");
			setImg(null);
			toast.success("Post created successfully");
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
	});

	// Mutation cho post có file
	const {
		mutate: createFilePost,
		isPending: filePending,
		isError: fileError,
		error: fileErr,
	} = useMutation({
		mutationFn: async ({ text, file }) => {
			const formData = new FormData();
			formData.append("text", text);
			formData.append("file", file);
			
			const res = await fetch("/api/posts/createFile", {
				method: "POST",
				body: formData
			});
			
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Upload failed");
			return data;
		},
		onSuccess: () => {
			setText("");
			setFile(null);
			toast.success("File post created");
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		if (file) {
			createFilePost({ text, file });
		} else {
			createPost({ text, img });
		}
	};

	const handleImgChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => setImg(reader.result);
			reader.readAsDataURL(file);
		}
	};

	const handleFileChange = (e) => {
		const selectedFile = e.target.files[0];
		if (selectedFile) setFile(selectedFile);
	};

	return (
		<div className='flex p-4 items-start gap-4 border-b border-gray-700'>
			<div className='avatar'>
				<div className='w-8 rounded-full'>
					<img src={authUser.profileImg || "/avatar-placeholder.png"} />
				</div>
			</div>
			<form className='flex flex-col gap-2 w-full' onSubmit={handleSubmit}>
				<textarea
					className='textarea w-full p-0 text-lg resize-none border-none focus:outline-none border-gray-800'
					placeholder='What is happening?!'
					value={text}
					onChange={(e) => setText(e.target.value)}
				/>

				{img && (
					<div className='relative w-72 mx-auto'>
						<IoCloseSharp
							className='absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer'
							onClick={() => {
								setImg(null);
								imgRef.current.value = null;
							}}
						/>
						<img src={img} className='w-full mx-auto h-72 object-contain rounded' />
					</div>
				)}

				{file && (
					<div className='relative w-fit mx-auto bg-gray-800 p-2 rounded text-white'>
						<IoCloseSharp
							className='absolute -top-2 -right-2 bg-gray-900 rounded-full w-5 h-5 cursor-pointer'
							onClick={() => {
								setFile(null);
								fileRef.current.value = null;
							}}
						/>
						{file.name}
					</div>
				)}

				<div className='flex justify-between border-t py-2 border-t-gray-700'>
					<div className='flex gap-2 items-center'>
						<CiImageOn
							className='fill-primary w-6 h-6 cursor-pointer'
							onClick={() => imgRef.current.click()}
						/>
						<input type='file' accept='image/*' hidden ref={imgRef} onChange={handleImgChange} />

						<CiFileOff
							className='fill-primary w-6 h-6 cursor-pointer'
							onClick={() => fileRef.current.click()}
						/>
						<input
							type='file'
							accept='.pdf,.doc,.docx,.xls,.xlsx'
							hidden
							ref={fileRef}
							onChange={handleFileChange}
						/>
					</div>

					<button className='btn btn-primary rounded-full btn-sm text-white px-4'>
						{isPending || filePending ? "Posting..." : "Post"}
					</button>
				</div>
				{(isError || fileError) && (
					<div className='text-red-500'>{(error || fileErr)?.message}</div>
				)}
			</form>
		</div>
	);
};
export default CreatePost;
