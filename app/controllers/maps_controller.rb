# encoding: UTF-8
class MapsController < ApplicationController
  require_login :except => [ :index, :show ]
  
  def index
    
  end

  def new
    @map = Map.new :user => current_user
  end
  
  def create
    @map = Map.new((params[:map]).merge(:user => current_user))
    @map.save
    flash[:message] = "Thanks! We’ve saved that map for you."
    redirect_to show_or_edit_map_path(@map) unless request.xhr?
  end

  def show
    @map = Map.find params[:id].to_map_code
    render :action => "edit" if logged_in? && current_user.id == @map.user_id
  end

  def edit
    @map = Map.find params[:id].to_map_code
  end

  def update
    @map = Map.find params[:id].to_map_code
    @map.update_attributes params[:map]
    redirect_to show_or_edit_map_path(@map) unless request.xhr?
  end

end
