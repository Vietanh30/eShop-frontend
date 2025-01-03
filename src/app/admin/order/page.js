"use client";

import AdminTab from "@/components/admin/adminTab";
import { useState, useEffect } from "react";
import { getAllOrder, updateStatus } from "@/app/api/orderApi";
import Modal from "@mui/material/Modal";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function AdminOrder() {
  const [products, setProducts] = useState([]);
  const [productAll, setProductAll] = useState([]);
  const [productLength, setProductLength] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedValue, setSelectedValue] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [res, setRes] = useState(null);

  const options = [
    { value: "pending", label: "Đang xử lý" },
    { value: "paid", label: "Đã xử lý" },
    { value: "canceled", label: "Hủy" },
  ];

  const [token, setToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchOrders(); // Gọi hàm fetchOrders khi component mount
  }, []);

  const fetchOrders = async () => {
    const token_ = localStorage.getItem("user-token");
    setToken(token_);
    const listProducts = await getAllOrder(token_);
    setProductAll(listProducts);
    setProducts(listProducts.slice(0, 10));
    setProductLength(listProducts?.length);
  };

  useEffect(() => {
    setProducts(productAll?.slice((currentPage - 1) * 10, currentPage * 10));
  }, [currentPage, productAll]); // Cập nhật khi productAll thay đổi

  const handleUpdateStatus = async () => {
    const token = localStorage.getItem("user-token");
    const response = await updateStatus(token, selectedValue, res?._id);

    if (response.status === 200) {
      Swal.fire({
        title: "Thành công",
        text: "Cập nhật tình trạng đơn hàng thành công!",
        icon: "success",
      });
      setOpenModal(false);
      fetchOrders(); // Gọi lại hàm fetchOrders để làm mới danh sách đơn hàng
    } else {
      Swal.fire({
        title: "Lỗi",
        text: response?.message || "Có lỗi xảy ra!",
        icon: "error",
      });
    }
  };

  return token ? (
    <div className="flex flex-row">
      <AdminTab />

      <div className="bg-primary_color/10 h-screen w-[85%] px-20 pt-10">
        <div className="bg-white drop-shadow-lg rounded p-8">
          <div className="flex items-center justify-between">
            <p className="font-bold font-primary text-primary_color text-xl py-4 border-b-2 px-4">
              Đơn hàng
            </p>
          </div>
          <div className="grid grid-cols-4 text-sm border-b-2 py-2">
            <p className="px-4 font-semibold text-black py-3">ID</p>
            <p className="px-4 font-semibold text-primary_color py-3">Method</p>
            <p className="px-4 font-semibold text-gray-800 py-3">Total Price</p>
            <p className="px-4 font-semibold text-primary_color py-3">Status</p>
          </div>
          <div className="h-[400px] overflow-y-auto">
            {products?.map((item) => (
              <div
                key={item._id}
                className="grid grid-cols-4 text-sm border-b-2 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setRes(item);
                  setOpenModal(true);
                  setSelectedValue(item.paymentStatus); // Đặt giá trị mặc định cho select
                }}
              >
                <p className="px-4 font-semibold py-3 text-black">{item._id}</p>
                <p className="px-4 text-primary_color py-3 line-clamp-2">
                  {item.paymentMethod}
                </p>
                <p className="px-4 text-gray-800 py-3">
                  {item.totalPrice.toLocaleString("en-US")} đ
                </p>
                <p className="px-4 text-primary_color py-3 line-clamp-2">
                  {item.paymentStatus}
                </p>
              </div>
            ))}
          </div>
          <div className="flex gap-x-3 items-center text-sm">
            <p
              onClick={() => {
                if (currentPage > 1) setCurrentPage(currentPage - 1);
              }}
              className="text-sub_primary_color border-2 rounded-lg py-1 px-2 cursor-pointer hover:text-primary_color hover:bg-gray-100"
            >
              {"<"}
            </p>
            <p className="text-primary_color">{currentPage}</p>
            <p
              onClick={() => {
                if (currentPage < Math.ceil(productLength / 10))
                  setCurrentPage(currentPage + 1);
              }}
              className="text-sub_primary_color border-2 rounded-lg py-1 px-2 cursor-pointer hover:text-primary_color hover:bg-gray-100"
            >
              {">"}
            </p>
          </div>
        </div>
      </div>

      <Modal
        open={openModal}
        onClose={() => setOpenModal(!openModal)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-1/2 bg-white drop-shadow-lg p-8">
          <div className="flex flex-col mb-4 text-primary_color">
            <p>Chi tiết đơn hàng:</p>
            <div className="overflow-y-auto max-h-[400px] flex flex-col gap-4 gap-y-2 mt-2 text-primary_color text-sm">
              {res?.orderList?.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-row justify-between border-b-2 border-gray-100 pt-4"
                >
                  <img
                    src={item.product.image[0]} // Giả định rằng đường dẫn ảnh nằm trong item.product.image
                    alt={item.product.name}
                    className="w-20 h-20 object-cover me-2" // Kích thước ảnh có thể điều chỉnh
                  />
                  <div className="flex flex-col flex-wrap gap-4 w-1/2">
                    <p className="line-clamp-1">
                      <b>Tên sản phẩm:</b> {item.product.name}
                    </p>
                    <p>
                      <b>Số lượng:</b> {item.quantity}
                    </p>
                  </div>

                  <div className="flex flex-col flex-wrap gap-4 w-1/2">
                    <p>
                      <b>Số tiền:</b>{" "}
                      {item.product.price.toLocaleString("en-US")} VND
                    </p>
                    <p>
                      <b>Màu:</b> {item.color}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-x-2 items-center my-8">
              <p className="text-gray-800 text-sm">
                Cập nhật tình trạng đơn hàng:{" "}
              </p>
              <div>
                <select
                  value={selectedValue}
                  onChange={(e) => setSelectedValue(e.target.value)}
                  className="text-sm text-primary_color border px-2 py-1"
                >
                  {options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <button
              className="block bg-teal-400 hover:bg-teal-600 text-white uppercase text-lg mx-auto p-2 rounded"
              type="submit"
              onClick={handleUpdateStatus}
            >
              Update
            </button>
          </div>
          <div
            className="uppercase text-md font-semibold text-sub_primary_color text-center p-4 rounded hover:text-blue-500 cursor-pointer"
            onClick={() => setOpenModal(!openModal)}
          >
            Back
          </div>
        </div>
      </Modal>
    </div>
  ) : null; // Không hiển thị Error
}
