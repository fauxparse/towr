require "auth"

class SessionsController < ApplicationController
  def new
    if api
      session[:return_to] ||= request.referrer
      redirect_to api.authentication_url
    else
      redirect_to "/"
    end
  end
  
  def create
    if @user = api.login
      session[:user_id] = @user.id
      @token = @user.remember_tokens.create
      cookies.permanent[:remember_me] = [@user.id, @token.to_s]
      redirect_to session[:return_to] || root_url
    else
      flash[:message] = "There was a problem logging you in."
      redirect_to login_prompt_path
    end
  end
  
  def destroy
    if logged_in?
      current_user.remember_tokens.destroy_all
      session.delete :user_id
      session.delete :return_to
      cookies.delete :remember_me
    end
    redirect_to root_url
  end
  
  def prompt
    
  end
  
protected
  def api
    @api ||= Auth[params[:method]].try(:new, self)
  end
end
