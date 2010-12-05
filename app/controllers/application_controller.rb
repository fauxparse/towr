class ApplicationController < ActionController::Base
  protect_from_forgery
  
protected
  def current_user
    @current_user ||= if session[:user_id].present?
      User.find_by_id(session[:user_id])
    elsif cookies[:remember_me].present?
      RememberToken.find_by_user_id_and_token(*cookies[:remember_me].split("&"), :include => :user).try(:user)
    end
  end
  helper_method :current_user
  
  def logged_in?
    current_user.present?
  end
  helper_method :logged_in?
  
  def self.require_login(*args)
    before_filter :confirm_login, *args
  end
    
  def confirm_login
    unless logged_in?
      session[:return_to] = request.params
      redirect_to login_prompt_path
    end
  end
  
end
