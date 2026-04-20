using BusinessLayer.Model;
using BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace BusinessLayer.Interface
{
    public interface IAdmin
    {
        public Task<ResponseResult> saveAdmin(Admin admin);
        public Task<ResponseResult> listAdmin();
        public Task<ResponseResult> deleteAdmin(int id);
        public Task<ResponseResult> updateAdmin(Admin admin);
        public Task<ResponseResult> getAdminById(int id);

        public Task<ResponseResult> SignUp(Admin admin);
        public Task<ResponseResult> SignIn(string email, string password);
        public Task<ResponseResult> ChangePassword(int id, string oldPassword, string newPassword);
        public Task<ResponseResult> ChangeProfile(Admin admin);
        public Task<ResponseResult> ForgotPassword(string email);

    }
}