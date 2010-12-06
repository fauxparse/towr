# encoding: UTF-8
class UsersController < ApplicationController
  require_login :except => :index
  
  def edit
    @user = current_user
  end
  
  def update
    @user = current_user
    if @user.update_attributes params[:user]
      flash[:message] = "Great! We’ve saved those details."
      redirect_to account_path
    else
      render :action => :edit
    end
  end
  
  def connect
    redirect_to api.authentication_url(connect_callback_url(params[:method]))
  end
  
  def connect_callback
    if @user = api.login(connect_callback_url(params[:method]))
      if @user.id != current_user.id
        @user.send(params[:method]).update_attributes :user => current_user
        User.delete @user.id
      end
    else
      flash[:message] = "There was a problem logging you in."
    end
    redirect_to account_path
  end

protected
  def api
    @api ||= Auth[params[:method]].try(:new, self)
  end
end
