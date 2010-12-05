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
      redirect_to session[:return_to] || root_url
    else
      flash[:message] = "There was a problem logging you in."
      redirect_to login_prompt_path
    end
  end
  
  def destroy
    session.delete :user_id
    session.delete :return_to
    redirect_to root_url
  end
  
  def prompt
    
  end
  
protected
  def api
    @api ||= Auth[params[:method]].try(:new, self)
  end
end
